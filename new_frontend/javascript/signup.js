document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    
    // 메시지 표시를 위한 요소 생성
    function createMessageElement() {
        let messageElement = document.getElementById('signupMessage');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'signupMessage';
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
      
    signupForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const termsChecked = document.getElementById('terms').checked;
        const privacyChecked = document.getElementById('privacy').checked;

        // 입력값 검증
        if (!username || !email || !password || !passwordConfirm) {
            showMessage('모든 필드를 입력해주세요.', 'error');
            return;
        }

        // 비밀번호 확인 검증
        if (password !== passwordConfirm) {
            showMessage('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        // 약관 동의 검증
        if (!termsChecked || !privacyChecked) {
            showMessage('모든 약관에 동의해주세요.', 'error');
            return;
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('올바른 이메일 형식을 입력해주세요.', 'error');
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
        const submitButton = signupForm.querySelector('.auth-button');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = '회원가입 중...';

        try {
            // API 요청 (api.py의 형식에 맞춰서)
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status === 201) {
                // 회원가입 성공
                showMessage('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...', 'success');
                
                // 폼 초기화
                signupForm.reset();
                
                // 2초 후에 로그인 페이지로 리다이렉트
                setTimeout(() => {
                    window.location.href = '/html/login.html';
                }, 2000);
            } else {
                // 회원가입 실패 - API 응답에 따른 구체적인 오류 메시지
                let errorMessage = '회원가입에 실패했습니다.';
                
                if (data.status === 400) {
                    if (data.error.includes('사용자명')) {
                        errorMessage = '이미 사용 중인 사용자명입니다.';
                    } else if (data.error.includes('이메일')) {
                        errorMessage = '이미 사용 중인 이메일입니다.';
                    } else {
                        errorMessage = data.error;
                    }
                } else {
                    errorMessage = data.error || '회원가입에 실패했습니다.';
                }
                
                showMessage(errorMessage, 'error');
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
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

    // 실시간 입력 검증 (선택적)
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const usernameInput = document.getElementById('username');

    // 이메일 실시간 검증
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#ddd';
        }
    });

    // 비밀번호 확인 실시간 검증
    passwordConfirmInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#ddd';
        }
    });

    // 사용자명 실시간 검증
    usernameInput.addEventListener('blur', function() {
        const username = this.value.trim();
        if (username && username.length < 3) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#ddd';
        }
    });

    // 소셜 로그인 버튼 이벤트 (추후 구현용)
    const kakaoButton = document.querySelector('.social-button.kakao');
    const googleButton = document.querySelector('.social-button.google');

    if (kakaoButton) {
        kakaoButton.addEventListener('click', function() {
            showMessage('카카오 회원가입 기능은 준비 중입니다.', 'error');
        });
    }

    if (googleButton) {
        googleButton.addEventListener('click', function() {
            showMessage('구글 회원가입 기능은 준비 중입니다.', 'error');
        });
    }

    // Enter 키로 폼 제출 방지 (체크박스 선택 확인)
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && event.target.type !== 'submit') {
            const termsChecked = document.getElementById('terms').checked;
            const privacyChecked = document.getElementById('privacy').checked;
            
            if (!termsChecked || !privacyChecked) {
                event.preventDefault();
                showMessage('모든 약관에 동의해주세요.', 'error');
            }
        }
    });
});