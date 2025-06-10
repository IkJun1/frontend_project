// 메인 페이지 기능 구현
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 로드 시 로그인 상태 확인 및 UI 업데이트
    checkLoginStatusAndUpdateUI();
    
    // 사용자 드롭다운 토글 기능
    initUserDropdown();
    
    // 장바구니 버튼 기능
    initCartButtons();
    
    // 네비게이션 링크 기능
    initNavigationLinks();
    
    // 검색 아이콘 기능
    initSearchIcon();
    
    // 페이지 로드 시 장바구니 개수 업데이트
    updateCartCount();
});

// 로그인 상태 확인 및 UI 업데이트 함수 (새로 추가)
async function checkLoginStatusAndUpdateUI() {
    try {
        const response = await fetch('/check', {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 200) {
            // 로그인된 상태 - UI 업데이트
            updateUIForLoggedInUser();
        } else {
            // 로그인되지 않은 상태 - UI 업데이트
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.log('로그인 상태 확인 실패:', error);
        // 오류 시 로그아웃 상태로 처리
        updateUIForLoggedOutUser();
    }
}

// 로그인된 사용자용 UI 업데이트 (새로 추가)
function updateUIForLoggedInUser() {
    const authNotLoggedIn = document.querySelector('.auth-not-logged-in');
    const authLoggedIn = document.querySelector('.auth-logged-in');
    
    if (authNotLoggedIn && authLoggedIn) {
        authNotLoggedIn.style.display = 'none';
        authLoggedIn.style.display = 'block';
        
        // 사용자명 표시 (세션 스토리지에서 가져오기)
        const username = sessionStorage.getItem('username') || localStorage.getItem('username') || '사용자';
        const usernameSpan = authLoggedIn.querySelector('.username');
        if (usernameSpan) {
            usernameSpan.textContent = username;
        }
        
        // 로그인 상태를 로컬 스토리지에 저장
        localStorage.setItem('isLoggedIn', 'true');
        if (username !== '사용자') {
            localStorage.setItem('username', username);
        }
    }
}

// 로그아웃된 사용자용 UI 업데이트 (새로 추가)
function updateUIForLoggedOutUser() {
    const authNotLoggedIn = document.querySelector('.auth-not-logged-in');
    const authLoggedIn = document.querySelector('.auth-logged-in');
    
    if (authNotLoggedIn && authLoggedIn) {
        authNotLoggedIn.style.display = 'block';
        authLoggedIn.style.display = 'none';
        
        // 로컬 스토리지 정리
        localStorage.removeItem('isLoggedIn');
    }
}

// 로그아웃 처리 함수 (새로 추가)
async function handleLogout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 200) {
            // 로컬/세션 스토리지 정리
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('username');
            localStorage.removeItem('isLoggedIn');
            
            // UI 업데이트
            updateUIForLoggedOutUser();
            
            // 알림 표시
            showNotification('로그아웃되었습니다.', 'success');
            
            // 1초 후 페이지 새로고침
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showNotification('로그아웃 중 오류가 발생했습니다.', 'error');
        }
    } catch (error) {
        console.error('로그아웃 오류:', error);
        showNotification('로그아웃 중 오류가 발생했습니다.', 'error');
    }
}

// 사용자 드롭다운 초기화 (수정)
function initUserDropdown() {
    const userDropdown = document.querySelector('.user-dropdown');
    const userInfoBtn = document.querySelector('.user-info-btn');
    
    if (userInfoBtn) {
        userInfoBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
    }
    
    // 다른 곳 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (userDropdown && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
    
    // 로그아웃 버튼 기능 (수정)
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout(); // 새로 추가된 함수 사용
        });
    }
}

// 장바구니 버튼 초기화
function initCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.price').textContent;
            
            // 로그인 상태 확인
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (isLoggedIn) {
                // 서버에 주문 요청
                handleOrderRequest(productName, productPrice);
            } else {
                // 로컬 스토리지에만 저장
                addToCartLocal(productName, productPrice);
            }
        });
    });
}

// 서버에 주문 요청
async function handleOrderRequest(productName, productPrice) {
    // 가격에서 ₩와 쉼표 제거하고 숫자만 추출
    const price = parseFloat(productPrice.replace(/[₩,]/g, ''));
    
    try {
        const response = await fetch('/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: productName,
                price: price
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 201) {
            showNotification(`${productName}이(가) 주문되었습니다.`);
            updateCartCount();
        } else if (data.status === 401) {
            showNotification('로그인이 필요합니다.', 'error');
            setTimeout(() => {
                window.location.href = '/html/login.html';
            }, 1000);
        } else {
            showNotification(data.error || '주문 처리 중 오류가 발생했습니다.', 'error');
        }
    } catch (error) {
        console.error('주문 오류:', error);
        showNotification('서버 연결 중 오류가 발생했습니다.', 'error');
    }
}

// 로컬 스토리지에 장바구니 추가
function addToCartLocal(productName, productPrice) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // 기존 상품 확인
    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now(),
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification(`${productName}이(가) 장바구니에 추가되었습니다.`);
    updateCartCount();
}

// 네비게이션 링크 초기화
function initNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            
            switch(target) {
                case '#home':
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    break;
                case '#new':
                case '#best':
                    scrollToSection('.featured-products');
                    break;
                case '#sale':
                    showNotification('세일 페이지는 준비 중입니다.');
                    break;
            }
        });
    });
    
    // CTA 버튼 기능
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            window.location.href = '/html/brands.html';
        });
    }
}

// 검색 아이콘 초기화
function initSearchIcon() {
    const searchIcon = document.querySelector('a[href="#search"]');
    
    if (searchIcon) {
        searchIcon.addEventListener('click', function(e) {
            e.preventDefault();
            openSearchModal();
        });
    }
}

// 섹션으로 스크롤
function scrollToSection(selector) {
    const section = document.querySelector(selector);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// 검색 모달 열기
function openSearchModal() {
    const searchTerm = prompt('상품을 검색하세요:');
    if (searchTerm) {
        showNotification(`"${searchTerm}" 검색 기능은 준비 중입니다.`);
    }
}

// 장바구니 개수 업데이트
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        let countBadge = cartIcon.querySelector('.cart-count');
        
        if (!countBadge && totalItems > 0) {
            countBadge = document.createElement('span');
            countBadge.className = 'cart-count';
            cartIcon.appendChild(countBadge);
        }
        
        if (countBadge) {
            if (totalItems > 0) {
                countBadge.textContent = totalItems;
                countBadge.style.display = 'flex';
            } else {
                countBadge.style.display = 'none';
            }
        }
    }
}

// 알림 표시
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: type === 'success' ? '#28a745' : type === 'info' ? '#17a2b8' : '#dc3545',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '5px',
        zIndex: '99999',
        fontSize: '14px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        minWidth: '200px',
        maxWidth: '300px',
        whiteSpace: 'nowrap',
        textAlign: 'center'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 기존 updateAuthUI 함수 제거하고 새로운 함수들로 대체됨

// 장바구니 아이콘 클릭 기능
document.addEventListener('DOMContentLoaded', function() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                showNotification('장바구니가 비어있습니다.', 'info');
                return;
            }
            
            showNotification('장바구니 페이지는 준비 중입니다.');
        });
    }
});