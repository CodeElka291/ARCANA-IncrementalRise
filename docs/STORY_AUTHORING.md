# ARCANA 스토리 작성 안내

이 프로젝트의 대화와 분기는 JavaScript 코드가 아니라 JSON 데이터로 작성합니다. 엔진은 장면 그래프를 읽고, 선택 조건을 확인한 뒤, 선택 효과를 플레이어 상태에 적용합니다.

## 파일과 연결 구조

- 현재 실행되는 스토리 파일: `content/story/arrival.json`
- 아이템, 퀘스트, 지역의 ID와 설정: `content/data/gameplay.json`
- 분기와 효과를 실행하는 엔진: `game/story-engine.js`
- 스토리 그래프 및 게임 데이터 참조 검사: `tools/validate_story.py`

현재 앱은 시작할 스토리 파일 하나를 불러옵니다. 장면을 추가할 때는 우선 `arrival.json`의 `nodes` 안에 장면을 추가하고, 선택지의 `next`에 다음 장면 ID를 적습니다. `next`는 같은 파일의 장면으로 연결합니다. 별도의 스토리 파일을 추가하기만 해서는 앱에서 자동으로 불러오지 않습니다.

## 장면과 선택지

각 장면은 고유한 ID와 `title`, `text`, `conditions`, `choices`를 가집니다. 조건이 비어 있으면 항상 표시됩니다. 선택지는 `id`, 플레이어에게 보일 `text`, 선택 가능 조건인 `conditions`, 상태 변경 목록인 `effects`, 다음 장면인 `next`로 구성합니다.

```json
{
  "storyId": "arrival",
  "version": 1,
  "startNode": "village_notice",
  "nodes": {
    "village_notice": {
      "title": "마을 게시판",
      "text": "게시판에 새 의뢰가 붙어 있습니다.",
      "conditions": [],
      "choices": [
        {
          "id": "accept_request",
          "text": "의뢰를 맡는다",
          "conditions": [],
          "effects": [
            { "type": "startQuest", "questId": "ruins_clue" }
          ],
          "next": "request_accepted"
        }
      ]
    },
    "request_accepted": {
      "title": "의뢰 수락",
      "text": "숲에서 단서를 찾아오기로 했습니다.",
      "conditions": [],
      "choices": []
    }
  }
}
```

이 예시는 구조 설명용입니다. 실제 `arrival.json`을 고칠 때는 기존 장면과 선택지를 유지하면서 필요한 부분을 병합하세요.

## 게임 시스템과 연결하기

스토리 ID는 `gameplay.json`의 ID를 참조해야 합니다. 검증기는 다음 참조가 실제 데이터에 있는지 검사합니다.

| 목적 | 선택 조건 예시 | 선택 효과 예시 |
| --- | --- | --- |
| 퀘스트 | `{ "type": "questStatus", "questId": "ruins_clue", "status": "complete" }` | `{ "type": "startQuest", "questId": "ruins_clue" }` |
| 아이템 | `{ "type": "hasItem", "itemId": "torn_record" }` | `{ "type": "grantItem", "itemId": "torn_record", "quantity": 1 }` |
| 지역 | `{ "type": "locationIs", "location": "forest" }` | `{ "type": "unlockLocation", "location": "forest" }` |
| 진행 플래그 | `{ "type": "flagEquals", "key": "found_ruins_clue", "value": true }` | `{ "type": "setFlag", "key": "found_ruins_clue", "value": true }` |
| 성장 | `{ "type": "levelAtLeast", "value": 2 }` | `{ "type": "grantXp", "amount": 10 }`, `{ "type": "grantGold", "amount": 5 }` |

선택 조건은 전부 만족해야 선택지가 표시됩니다. 전투처럼 스토리 밖의 게임 행동이 퀘스트 상태나 플래그를 바꾸면, 플레이어가 `이야기`를 다시 열었을 때 그 상태에 맞는 선택지가 나타납니다. 이 방식으로 대화 선택과 탐험·전투·보상을 연결합니다.

현재 지원하는 조건은 `flagEquals`, `levelAtLeast`, `hasItem`, `questStatus`, `locationIs`입니다. 효과는 `setFlag`, `startQuest`, `advanceQuest`, `completeQuest`, `grantItem`, `removeItem`, `grantXp`, `grantGold`, `unlockLocation`, `changeRelation`입니다. 새 조건이나 효과가 필요하면 JSON에 임의의 JavaScript를 넣지 말고, 엔진과 두 검증기(브라우저·Python)에 같은 규칙을 추가해야 합니다.

## 작성 규칙

1. 장면 ID와 선택지 ID는 영문 소문자와 밑줄로 작성합니다. 플레이어에게 보이는 문장은 `title`, `text`, `choice.text`에 적습니다.
2. 모든 `next`는 `nodes` 안에 실제로 존재해야 합니다. 모든 장면은 시작 장면에서 도달 가능해야 합니다.
3. 퀘스트, 아이템, 지역을 참조할 때는 `gameplay.json`에 먼저 정의하고 같은 ID를 사용합니다.
4. 선택 효과는 선택이 확정될 때 한 번 적용됩니다. 보상 효과를 바꿀 때는 이미 선택한 캐릭터의 기록에도 영향을 줄지 검토합니다.
5. 배포한 선택지 ID와 장면 ID는 가급적 유지합니다. 저장 데이터의 스토리 이력과 보상 중복 방지에 사용됩니다.
6. 막다른 장면은 `choices: []`인 실제 장면으로 표현하고, 그 장면으로 `next`를 연결합니다. 선택지에서 `next`를 생략하면 스토리 진행 위치가 초기화됩니다.

## 확인 방법

스토리를 수정한 뒤 프로젝트 루트에서 다음 명령을 실행합니다.

```powershell
python tools/validate_story.py content/story/arrival.json
```

정상 데이터는 스토리 ID, 버전, 장면 수와 함께 `OK`로 표시됩니다. 잘못된 장면 연결, 도달할 수 없는 장면, 지원하지 않는 규칙, 없는 퀘스트·아이템·지역 ID는 오류로 표시됩니다. 로그인 후 게임 화면에서도 불러오는 스토리를 브라우저 검증기로 확인합니다.
