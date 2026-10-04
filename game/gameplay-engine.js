(function (global) {
    "use strict";

    function awardXp(state, amount) {
        state.xp += amount;
        const levels = [];
        while (state.xp >= state.level * 20) {
            state.xp -= state.level * 20;
            state.level += 1;
            state.maxHp += 5;
            state.hp = state.maxHp;
            levels.push(state.level);
        }
        return levels;
    }

    function grantXp(state, amount) { return awardXp(state, amount); }

    function explore(data, state, random = Math.random) {
        if (state.location !== "forest") return { messages: ["탐험할 수 있는 곳은 숲입니다. '숲'으로 이동하세요."], changed: false };
        if (state.combat) return { messages: ["전투 중입니다. 먼저 '공격'하거나 '도망'을 입력하세요."], changed: false };
        const location = data.locations[state.location];
        if (random() < location.encounterChance) {
            const monster = data.monsters[location.monsterId];
            state.combat = { monsterId: location.monsterId, hp: monster.hp };
            return { messages: [`숲길에서 ${monster.name}이(가) 나타났습니다! 체력 ${monster.hp}. '공격' 또는 '도망'을 선택하세요.`], changed: true };
        }
        const found = random() < 0.5;
        if (found) {
            state.inventory.forest_herb = (state.inventory.forest_herb || 0) + 1;
            return { messages: ["숲에서 약초를 찾았습니다. (숲 약초 x1)"], changed: true };
        }
        const gold = 2 + Math.floor(random() * 4);
        state.gold += gold;
        return { messages: [`숲길을 익히고 ${gold} 골드를 발견했습니다.`], changed: true };
    }

    function attack(data, state, random = Math.random) {
        if (!state.combat) return { messages: ["싸울 상대가 없습니다. 숲에서 '탐험'하세요."], changed: false };
        const monster = data.monsters[state.combat.monsterId];
        if (!monster) throw new Error(`몬스터 데이터 '${state.combat.monsterId}'가 없습니다.`);
        const damage = 4 + Math.floor((state.level - 1) / 3);
        state.combat.hp = Math.max(0, state.combat.hp - damage);
        const messages = [`${monster.name}에게 ${damage} 피해를 입혔습니다. (${state.combat.hp}/${monster.hp})`];
        if (state.combat.hp === 0) {
            state.combat = null;
            state.gold += monster.gold;
            const gainedLevels = awardXp(state, monster.xp);
            messages.push(`${monster.name}을(를) 물리쳤습니다. 경험치 ${monster.xp}, 골드 ${monster.gold}을(를) 얻었습니다.`);
            if (state.quests.ruins_clue === "active") {
                state.quests.ruins_clue = "complete";
                state.flags.cleared_ruins_path = true;
                messages.push("퀘스트 완료: 폐허의 단서. 숲늑대를 물리쳐 북쪽 길을 안전하게 만들었습니다.");
            }
            if (gainedLevels.length) messages.push(`레벨 업! 레벨 ${gainedLevels.join(", ")}. 체력이 회복되었습니다.`);
            return { messages, changed: true };
        }
        const incoming = monster.attack;
        state.hp = Math.max(0, state.hp - incoming);
        messages.push(`${monster.name}의 반격으로 ${incoming} 피해를 받았습니다. (체력 ${state.hp}/${state.maxHp})`);
        if (state.hp === 0) {
            const lostGold = Math.floor(state.gold * 0.1);
            state.gold -= lostGold;
            state.hp = Math.max(1, Math.ceil(state.maxHp / 2));
            state.location = "village";
            state.combat = null;
            messages.push(`쓰러져 마을 여관에서 깨어났습니다. 골드 ${lostGold}을(를) 잃었고 체력이 ${state.hp}까지 회복되었습니다.`);
        }
        return { messages, changed: true };
    }

    function flee(state) {
        if (!state.combat) return { messages: ["도망칠 전투가 없습니다."], changed: false };
        state.combat = null;
        state.location = "village";
        return { messages: ["전투를 피해 마을로 돌아왔습니다."], changed: true };
    }

    function useItem(data, state, rawItemId) {
        const aliases = { "물약": "healing_potion", "회복 물약": "healing_potion", "약초": "forest_herb", "숲 약초": "forest_herb" };
        const itemId = aliases[rawItemId] || rawItemId;
        const item = data.items[itemId];
        if (!item) return { messages: [`알 수 없는 아이템입니다: ${rawItemId}`], changed: false };
        if (!(state.inventory[itemId] > 0)) return { messages: [`${item.name}을(를) 가지고 있지 않습니다.`], changed: false };
        if (item.type !== "consumable") return { messages: [`${item.name}은(는) 지금 사용할 수 없습니다.`], changed: false };
        if (item.heal && state.hp >= state.maxHp) return { messages: ["체력이 가득 차 있습니다."], changed: false };
        state.inventory[itemId] -= 1;
        if (item.heal) {
            const healed = Math.min(item.heal, state.maxHp - state.hp);
            state.hp += healed;
            return { messages: [`${item.name}을(를) 사용해 체력을 ${healed} 회복했습니다. (${state.hp}/${state.maxHp})`], changed: true };
        }
        return { messages: [`${item.name}을(를) 사용했습니다.`], changed: true };
    }

    function buyItem(data, state, rawItemId) {
        const aliases = { "물약": "healing_potion", "회복 물약": "healing_potion" };
        const itemId = aliases[rawItemId] || rawItemId;
        const item = data.items[itemId];
        if (state.location !== "market") return { messages: ["장터에서만 물건을 살 수 있습니다."], changed: false };
        if (!item || !Number.isInteger(item.price)) return { messages: [`장터에 '${rawItemId}' 상품이 없습니다.`], changed: false };
        if (state.gold < item.price) return { messages: [`${item.name} 가격은 ${item.price} 골드입니다. 골드가 부족합니다.`], changed: false };
        state.gold -= item.price;
        state.inventory[itemId] = (state.inventory[itemId] || 0) + 1;
        return { messages: [`${item.name}을(를) ${item.price} 골드에 구입했습니다.`], changed: true };
    }

    global.ArcanaGameplayEngine = { explore, attack, flee, useItem, buyItem, grantXp };
})(window);
