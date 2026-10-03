const output = document.getElementById("output");
const form = document.getElementById("commandForm");
const input = document.getElementById("commandInput");
const prompt = document.getElementById("prompt");
const authPanel = document.getElementById("authPanel");
const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");
const authSubmit = document.getElementById("authSubmit");
const authModeToggle = document.getElementById("authModeToggle");
const resendConfirmationButton = document.getElementById("resendConfirmationButton");
const characterNameField = document.getElementById("characterNameField");
const characterNameInput = document.getElementById("characterName");
const gamePanel = document.getElementById("gamePanel");
const accountLabel = document.getElementById("accountLabel");
const signOutButton = document.getElementById("signOutButton");

const player = {
    name: "",
    location: "village"
};

let authMode = "login";
let activeUserId = null;

function writeLine(text = "", className = "") {
    const line = document.createElement("p");
    line.className = className;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function setPrompt() {
    prompt.textContent = `${player.name}@${player.location === "forest" ? "숲" : player.location === "market" ? "장터" : "초심자의 마을"}>`;
    input.placeholder = "명령어를 입력하고 Enter를 누르세요";
}

function showHelp() {
    writeLine("사용 가능한 명령어:");
    writeLine("  보기 (look)       주변을 살펴봅니다.");
    writeLine("  상태 (status)     현재 상태를 확인합니다.");
    writeLine("  소지품 (inventory) 소지품을 확인합니다.");
    writeLine("  검 / 책           검을 들어보거나 책을 펼칩니다.");
    writeLine("  장터 / 숲 / 마을  해당 장소로 이동합니다.");
    writeLine("  도움말 (help)     명령어 목록을 확인합니다.");
}

function lookAround() {
    if (player.location === "forest") {
        writeLine("[깊은 숲] 나무들이 햇빛을 가리고 있습니다. 멀리서 정체를 알 수 없는 울음소리가 들립니다.");
        writeLine("마을로 돌아가려면 '마을' 또는 '이동 마을'을 입력하세요.");
    } else if (player.location === "market") {
        writeLine("[장터] 상인들의 목소리와 사람들의 발걸음으로 북적입니다. 아직 문을 연 가게는 많지 않습니다.");
        writeLine("마을로 돌아가려면 '마을' 또는 '이동 마을'을 입력하세요.");
    } else {
        writeLine("[초심자의 마을] 낡은 게시판과 작은 여관이 보입니다. 동쪽 길은 장터로, 북쪽 길은 숲으로 이어집니다.");
        writeLine("검을 들어보거나 책을 펼쳐볼 수 있습니다.");
    }
}

function moveTo(destination) {
    const place = destination.trim().toLowerCase();

    if (["숲", "숲으로", "숲으로 향한다", "forest", "북쪽"].includes(place)) {
        player.location = "forest";
        setPrompt();
        writeLine("당신은 마을을 떠나 숲으로 향합니다.");
        lookAround();
        return;
    }

    if (["장터", "장터로", "장터를 둘러본다", "시장", "market", "동쪽"].includes(place)) {
        player.location = "market";
        setPrompt();
        writeLine("당신은 동쪽 길을 따라 장터로 향합니다.");
        lookAround();
        return;
    }

    if (["마을", "마을로", "town", "귀환", "돌아가기"].includes(place)) {
        player.location = "village";
        setPrompt();
        writeLine("당신은 초심자의 마을로 돌아옵니다.");
        lookAround();
        return;
    }

    writeLine(`'${destination}'(으)로는 갈 수 없습니다. '보기'로 주변을 확인하세요.`);
}

function runCommand(command) {
    const normalized = command.trim().toLowerCase();

    if (!normalized) {
        return;
    }

    if (["도움말", "help", "?"].includes(normalized)) {
        showHelp();
    } else if (["보기", "주변", "look", "살펴본다"].includes(normalized)) {
        lookAround();
    } else if (["상태", "status"].includes(normalized)) {
        writeLine(`[상태] ${player.name} | 신입 모험가 | 위치: ${player.location === "forest" ? "숲" : player.location === "market" ? "장터" : "초심자의 마을"}`);
    } else if (["소지품", "인벤토리", "inventory"].includes(normalized)) {
        writeLine("[소지품] 비어 있습니다.");
    } else if (["검", "검을 든다", "검을 들어본다", "검을 들어"].includes(normalized)) {
        writeLine("당신은 낡은 연습용 검을 들어 올립니다. 아직은 검을 휘두르는 것조차 어색합니다.");
    } else if (["책", "책을 펼친다", "책을 펼쳐본다", "읽기"].includes(normalized)) {
        writeLine("책장을 펼칩니다. 첫 장에는 이렇게 적혀 있습니다. \"모든 위대한 여정은 작은 선택에서 시작된다.\"");
    } else if (normalized.startsWith("이동 ") || normalized.startsWith("go ")) {
        moveTo(command.slice(command.indexOf(" ") + 1));
    } else if (["숲", "숲으로", "숲으로 향한다", "북쪽", "장터", "장터로", "장터를 둘러본다", "동쪽", "마을", "마을로", "귀환"].includes(normalized)) {
        moveTo(normalized);
    } else {
        writeLine(`알 수 없는 명령어입니다: ${command}`);
        writeLine("'도움말'을 입력하면 사용할 수 있는 명령어를 확인할 수 있습니다.");
    }
}

function beginGame(name) {
    player.name = name;
    setPrompt();
    writeLine("새로운 기록이 생성되었습니다.");
    writeLine(` ${name}`);
    writeLine("당신은 아직 아무것도 아닙니다.");
    writeLine("위대한 존재들은 처음부터 위대하지 않았습니다.");
    writeLine("");
    writeLine("[신입 모험가]");
    writeLine("당신은 이름만 가진 채 세계에 첫발을 내디뎠습니다.");
    lookAround();
    writeLine("");
    writeLine("무엇을 하시겠습니까? '도움말'을 입력해 명령어를 확인하세요.");
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const command = input.value.trim();
    input.value = "";

    if (!command) {
        return;
    }

    writeLine(`${prompt.textContent} ${command}`, "command-line");
    runCommand(command);
});

function showAuthMessage(message, isError = false) {
    authMessage.textContent = message;
    authMessage.classList.toggle("error", isError);
}

function getEmailRedirectUrl() {
    return window.ARCANA_SUPABASE_CONFIG.redirectUrl;
}

function setAuthMode(mode) {
    authMode = mode;
    const isSignUp = mode === "signup";
    characterNameField.hidden = !isSignUp;
    characterNameInput.required = isSignUp;
    document.getElementById("authTitle").textContent = isSignUp
        ? "새 모험가 기록 만들기"
        : "기록의 서고에 접속";
    document.getElementById("authDescription").textContent = isSignUp
        ? "계정을 만들고 새로운 여정을 시작하세요."
        : "이메일과 비밀번호로 모험가 기록에 로그인하세요.";
    authSubmit.textContent = isSignUp ? "계정 만들기" : "로그인";
    authModeToggle.textContent = isSignUp ? "이미 계정이 있어요" : "새 계정 만들기";
    document.getElementById("authPassword").autocomplete = isSignUp
        ? "new-password"
        : "current-password";
    resendConfirmationButton.hidden = true;
    showAuthMessage("");
}

function showGame(user) {
    const name = user.user_metadata?.character_name?.trim()
        || user.email?.split("@")[0]
        || "모험가";

    activeUserId = user.id;
    authPanel.hidden = true;
    gamePanel.hidden = false;
    accountLabel.textContent = user.email || name;
    output.replaceChildren();
    player.location = "village";
    beginGame(name);
    input.focus();
}

function showLogin() {
    activeUserId = null;
    gamePanel.hidden = true;
    authPanel.hidden = false;
    player.name = "";
    showAuthMessage("");
    document.getElementById("authEmail").focus();
}

function renderSession(session) {
    if (session?.user) {
        if (activeUserId !== session.user.id) {
            showGame(session.user);
        }
        return;
    }

    if (activeUserId !== null || gamePanel.hidden === false) {
        showLogin();
    }
}

function initializeSupabase() {
    if (!window.supabase?.createClient || !window.ARCANA_SUPABASE_CONFIG?.url || !window.ARCANA_SUPABASE_CONFIG?.publishableKey) {
        showAuthMessage("로그인 서비스를 불러오지 못했습니다. 네트워크와 Supabase 설정을 확인하세요.", true);
        authSubmit.disabled = true;
        authModeToggle.disabled = true;
        return;
    }

    const supabaseClient = window.supabase.createClient(
        window.ARCANA_SUPABASE_CONFIG.url,
        window.ARCANA_SUPABASE_CONFIG.publishableKey
    );

    const callbackParams = new URLSearchParams(window.location.hash.slice(1));
    if (callbackParams.get("error_code") === "otp_expired") {
        setAuthMode("signup");
        showAuthMessage("이메일 확인 링크가 만료되었거나 이미 사용되었습니다. 이메일 주소를 입력하고 확인 메일을 다시 보내세요.", true);
        resendConfirmationButton.hidden = false;
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } else if (callbackParams.has("error")) {
        showAuthMessage(
            callbackParams.get("error_description") || "이메일 확인 중 오류가 발생했습니다. 새 확인 메일을 요청해 주세요.",
            true
        );
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    authModeToggle.addEventListener("click", () => {
        setAuthMode(authMode === "login" ? "signup" : "login");
    });

    resendConfirmationButton.addEventListener("click", async () => {
        const email = document.getElementById("authEmail").value.trim();
        if (!email) {
            showAuthMessage("확인 메일을 받을 이메일 주소를 입력하세요.", true);
            document.getElementById("authEmail").focus();
            return;
        }

        resendConfirmationButton.disabled = true;
        showAuthMessage("");
        try {
            const { error } = await supabaseClient.auth.resend({
                type: "signup",
                email,
                options: { emailRedirectTo: getEmailRedirectUrl() }
            });
            if (error) {
                throw error;
            }
            showAuthMessage("새 확인 메일을 요청했습니다. 받은 편지함을 확인하세요.");
        } catch (error) {
            showAuthMessage(`확인 메일을 보내지 못했습니다: ${error.message}`, true);
        } finally {
            resendConfirmationButton.disabled = false;
        }
    });

    authForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showAuthMessage("");

        const email = document.getElementById("authEmail").value.trim();
        const password = document.getElementById("authPassword").value;
        const name = characterNameInput.value.trim();
        if (authMode === "signup" && !name) {
            showAuthMessage("모험가 이름을 입력하세요.", true);
            characterNameInput.focus();
            return;
        }

        authSubmit.disabled = true;
        authModeToggle.disabled = true;

        try {
            if (authMode === "signup") {
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { character_name: name },
                        emailRedirectTo: getEmailRedirectUrl()
                    }
                });
                if (error) {
                    throw error;
                }
                if (!data.session) {
                    showAuthMessage("가입 요청이 완료되었습니다. 이메일을 확인한 뒤 로그인하세요.");
                    resendConfirmationButton.hidden = false;
                }
            } else {
                const { error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) {
                    throw error;
                }
            }
        } catch (error) {
            showAuthMessage(`인증에 실패했습니다: ${error.message}`, true);
        } finally {
            authSubmit.disabled = false;
            authModeToggle.disabled = false;
        }
    });

    signOutButton.addEventListener("click", async () => {
        signOutButton.disabled = true;
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                writeLine(`[오류] 로그아웃에 실패했습니다: ${error.message}`);
            }
        } catch (error) {
            writeLine(`[오류] 로그아웃에 실패했습니다: ${error.message}`);
        } finally {
            signOutButton.disabled = false;
        }
    });

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        renderSession(session);
    });

    supabaseClient.auth.getSession()
        .then(({ data, error }) => {
            if (error) {
                showAuthMessage(`저장된 로그인 정보를 확인하지 못했습니다: ${error.message}`, true);
                return;
            }
            renderSession(data.session);
        })
        .catch((error) => {
            showAuthMessage(`저장된 로그인 정보를 확인하지 못했습니다: ${error.message}`, true);
        });
}

setAuthMode("login");
initializeSupabase();
