document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // 메시지 표시를 위한 요소 생성
    function createMessageElement() {
        let messageElement = document.getElementById('loginMessage');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'loginMessage';
            messageElement.className = 'message';
            messageElement.style.display = 'none';
            messageElement.style.cssText = `
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                text-align: center;
            `;
            
            // h2 태그 다음에 메시지 요소 삽입
            const h2Element = document.querySelector('.auth-box h2');
            h2Element.parentNode.insertBefore(messageElement, h2Element.nextSibling);
        }
        return messageElement;
    }
    
    const messageElement = createMessageElement();
      
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember').checked;

        // 입력값 검증
        if (!username || !password) {
            showMessage('사용자명과 비밀번호를 모두 입력해주세요.', 'error');
            return;
        }

        // 사용자명 길이 검증
        if (username.length < 3) {
            showMessage('사용자명은 최소 3자리 이상이어야 합니다.', 'error');
            return;
        }

        // 비밀번호 길이 검증
        if (password.length < 6) {
            showMessage('비밀번호는 최소 6자리 이상이어야 합니다.', 'error');
            return;
        }

        // 로딩 상태 표시
        const submitButton = loginForm.querySelector('.auth-button');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = '로그인 중...';

        try {
            // API 요청 (api.py의 형식에 맞춰서)
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status === 200) {
                // 로그인 성공
                showMessage('로그인 성공! 메인 페이지로 이동합니다...', 'success');
                
                // 로그인 상태 유지 체크시 로컬 스토리지에 저장
                if (rememberMe) {
                    localStorage.setItem('username', username);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('username');
                    localStorage.removeItem('rememberMe');
                }
                
                // 세션 스토리지에 로그인 상태 저장
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);
                
                // 폼 초기화
                loginForm.reset();
                
                // 1초 후에 메인 페이지로 리다이렉트
                setTimeout(() => {
                    window.location.href = '/html/index.html';
                }, 1000);
            } else {
                // 로그인 실패 - API 응답에 따른 구체적인 오류 메시지
                let errorMessage = '로그인에 실패했습니다.';
                
                if (data.status === 404) {
                    errorMessage = '존재하지 않는 사용자입니다.';
                } else if (data.status === 401) {
                    errorMessage = '비밀번호가 일치하지 않습니다.';
                } else {
                    errorMessage = data.error || '로그인에 실패했습니다.';
                }
                
                showMessage(errorMessage, 'error');
                
                // 비밀번호 필드 초기화
                document.getElementById('password').value = '';
                document.getElementById('password').focus();
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            showMessage('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
        } finally {
            // 로딩 상태 해제
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    // 메시지 표시 함수
    function showMessage(message, type) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        
        // 타입별 스타일 적용
        if (type === 'success') {
            messageElement.style.backgroundColor = '#d4edda';
            messageElement.style.color = '#155724';
            messageElement.style.border = '1px solid #c3e6cb';
        } else if (type === 'error') {
            messageElement.style.backgroundColor = '#f8d7da';
            messageElement.style.color = '#721c24';
            messageElement.style.border = '1px solid #f5c6cb';
        }
        
        messageElement.style.display = 'block';
        
        // 스크롤을 메시지로 이동
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 성공 메시지는 자동으로 사라지게 설정
        if (type === 'success') {
            setTimeout(function() {
                messageElement.style.display = 'none';
            }, 3000);
        }
    }

    // 페이지 로드 시 저장된 사용자명 불러오기
    const savedUsername = localStorage.getItem('username');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (savedUsername && rememberMe === 'true') {
        document.getElementById('username').value = savedUsername;
        document.getElementById('remember').checked = true;
        document.getElementById('password').focus(); // 패스워드 필드에 포커스
    } else {
        document.getElementById('username').focus(); // 사용자명 필드에 포커스
    }

    // 소셜 로그인 버튼 이벤트
    const kakaoButton = document.querySelector('.social-button.kakao');
    const googleButton = document.querySelector('.social-button.google');

    if (kakaoButton) {
        kakaoButton.addEventListener('click', function() {
            showMessage('카카오 로그인 기능은 준비 중입니다.', 'error');
        });
    }

    if (googleButton) {
        googleButton.addEventListener('click', function() {
            showMessage('구글 로그인 기능은 준비 중입니다.', 'error');
        });
    }

    // 비밀번호 찾기 링크 이벤트
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(event) {
            event.preventDefault();
            showMessage('비밀번호 찾기 기능은 준비 중입니다.', 'error');
        });
    }

    // Enter 키 처리
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;
            
            if (activeElement.id === 'username' && activeElement.value.trim()) {
                document.getElementById('password').focus();
                event.preventDefault();
            } else if (activeElement.id === 'password' && activeElement.value) {
                loginForm.dispatchEvent(new Event('submit'));
                event.preventDefault();
            }
        }
    });

    // 실시간 입력 검증
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    usernameInput.addEventListener('blur', function() {
        const username = this.value.trim();
        if (username && username.length < 3) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#ddd';
        }
    });

    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        if (password && password.length < 6) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#ddd';
        }
    });

    // 입력 시 오류 테두리 제거
    usernameInput.addEventListener('input', function() {
        this.style.borderColor = '#ddd';
        // 오류 메시지 숨기기
        if (messageElement.style.display === 'block' && messageElement.className.includes('error')) {
            messageElement.style.display = 'none';
        }
    });

    passwordInput.addEventListener('input', function() {
        this.style.borderColor = '#ddd';
        // 오류 메시지 숨기기
        if (messageElement.style.display === 'block' && messageElement.className.includes('error')) {
            messageElement.style.display = 'none';
        }
    });

    // 로그인 상태 확인 (이미 로그인된 경우 메인 페이지로 리다이렉트)
    checkLoginStatus();

    async function checkLoginStatus() {
        try {
            const response = await fetch('/check', {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status === 200) {
                // 이미 로그인된 상태
                showMessage('이미 로그인되어 있습니다. 메인 페이지로 이동합니다...', 'success');
                setTimeout(() => {
                    window.location.href = '/html/index.html';
                }, 1000);
            }
        } catch (error) {
            // 로그인 상태 확인 실패는 무시 (로그인 페이지에 머물기)
            console.log('로그인 상태 확인 실패 (정상)');
        }
    }
});