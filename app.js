function startGame() {

    const name =
        document.getElementById("playerName").value;

    if (!name.trim()) {

        alert("이름을 입력하세요.");
        return;
    }

    localStorage.setItem(
        "air_player_name",
        name
    );

    document.getElementById("content").innerHTML = `
        <p>새로운 기록이 생성되었습니다.</p>

        <p><strong>${name}</strong></p>

        <p>당신은 아직 아무것도 아닙니다.</p>

        <p>
        위대한 존재들은
        처음부터 위대하지 않았습니다.
        </p>

        <button onclick="enterWorld()">
            세계로 들어간다
        </button>
    `;
}

function enterWorld() {

    document.getElementById("content").innerHTML = `

        <p>[신입 모험가]</p>

        <p>
        당신은 이름만 가진 채<br>
        세계에 첫발을 내디뎠습니다.
        </p>

        <p>
        무엇을 하시겠습니까?
        </p>

        <button>검을 들어본다</button>
        <button>책을 펼쳐본다</button>
        <button>장터를 둘러본다</button>
        <button>숲으로 향한다</button>

    `;
}