// 페이지 로드 시 사용자 정보 가져오기
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadOrders(); // 주문 내역 로드 추가
    initMypageFunctions();
});

// 사용자 정보 로드 함수
async function loadUserInfo() {
    try {
        const response = await fetch('/user-info', {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 200) {
            // 사용자 정보 업데이트 (프로필 이미지 포함)
            updateUserInfo(data.username, data.email, data.profile_image);
        } else if (data.status === 401) {
            alert('로그인이 필요합니다.');
            window.location.href = '/html/login.html';
        } else {
            console.error('사용자 정보 로드 실패:', data.error);
            showNotification('사용자 정보를 불러오는데 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        showNotification('서버 연결 중 오류가 발생했습니다.', 'error');
    }
}

// 주문 내역 로드 함수 (새로 추가)
async function loadOrders() {
    try {
        const response = await fetch('/check', {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 200) {
            // /check API는 Products 배열을 반환하므로 이를 처리
            const products = data.Products;
            displayOrders(products);
        } else if (data.status === 401) {
            console.log('로그인이 필요합니다.');
        } else {
            console.error('주문 내역 로드 실패:', data.error);
            showNotification('주문 내역을 불러오는데 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('주문 내역 로드 오류:', error);
        showNotification('서버 연결 중 오류가 발생했습니다.', 'error');
    }
}

// 주문 내역 표시 함수 (새로 추가)
function displayOrders(products) {
    const orderList = document.querySelector('.order-list');
    if (!orderList) return;

    // 기존 내용 삭제 (하드코딩된 주문 카드 제거)
    orderList.innerHTML = '';

    if (!products || products.length === 0) {
        orderList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-shopping-bag"></i>
                <h3>주문 내역이 없습니다</h3>
                <p>첫 번째 주문을 시작해보세요!</p>
                <button class="btn-primary" onclick="window.location.href='/html/brands.html'">쇼핑하러 가기</button>
            </div>
        `;
        return;
    }

    // 각 상품별로 카드 생성 (products는 [['product1'], ['product2']] 형태)
    products.forEach((productArray, index) => {
        const productName = productArray[0]; // 배열의 첫 번째 요소가 상품명
        const orderCard = createOrderCard(productName, index + 1);
        orderList.appendChild(orderCard);
    });

    // 동적으로 생성된 요소들에 이벤트 리스너 추가
    initDynamicOrderEvents();
}

// 주문 카드 생성 함수 (새로 추가)
function createOrderCard(productName, orderIndex) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    orderCard.dataset.orderIndex = orderIndex;

    // 현재 날짜를 주문 날짜로 사용 (실제로는 DB에서 timestamp 가져와야 함)
    const today = new Date().toISOString().split('T')[0];
    
    orderCard.innerHTML = `
        <div class="order-header">
            <span class="order-date">${today}</span>
            <span class="order-status status-delivered">배송완료</span>
        </div>
        <div class="order-items">
            <div class="order-item">
                <img src="https://via.placeholder.com/100" alt="상품 이미지">
                <div class="item-info">
                    <h4>${productName}</h4>
                    <p>수량: 1개</p>
                    <p class="price">가격 정보 없음</p>
                </div>
            </div>
        </div>
        <div class="order-actions">
            <button class="btn-secondary track-btn" data-product="${productName}">배송조회</button>
            <button class="btn-primary review-btn" data-product="${productName}">리뷰작성</button>
        </div>
    `;

    return orderCard;
}

// 동적으로 생성된 주문 요소들에 이벤트 추가 (새로 추가)
function initDynamicOrderEvents() {
    // 리뷰 작성 버튼
    document.querySelectorAll('.review-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.dataset.product;
            showReviewModal(productName);
        });
    });

    // 배송 조회 버튼
    document.querySelectorAll('.track-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.dataset.product;
            trackDelivery(productName);
        });
    });
}

// 배송 조회 함수 (새로 추가)
function trackDelivery(productName) {
    showNotification(`${productName}의 배송 조회 기능은 준비 중입니다.`, 'info');
}

// 사용자 정보 UI 업데이트 함수
function updateUserInfo(username, email) {
    // 사이드바의 사용자 정보 업데이트
    const sidebarUserName = document.querySelector('.user-info h3');
    const sidebarUserEmail = document.querySelector('.user-info p');
    
    if (sidebarUserName) {
        sidebarUserName.textContent = username;
    }
    
    if (sidebarUserEmail) {
        sidebarUserEmail.textContent = email;
    }
    
    // 계정 설정 섹션의 입력 필드 업데이트
    const nameInput = document.querySelector('#settings input[type="text"]');
    const emailInput = document.querySelector('#settings input[type="email"]');
    
    if (nameInput) {
        nameInput.value = username;
    }
    
    if (emailInput) {
        emailInput.value = email;
    }
    
    // 헤더의 사용자명도 업데이트 (드롭다운에 있는 경우)
    const headerUsername = document.querySelector('.username');
    if (headerUsername) {
        headerUsername.textContent = username;
    }
}

// 기존 마이페이지 기능들 초기화
function initMypageFunctions() {
    // 마이페이지 탭 전환 기능
    const navLinks = document.querySelectorAll('.mypage-nav a');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 활성화된 링크 스타일 변경
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 해당 섹션 표시
            const targetId = this.getAttribute('href').substring(1);
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });

    // 위시리스트 기능 (정적 요소용)
    document.querySelectorAll('.wishlist-actions .btn-primary').forEach(button => {
        button.addEventListener('click', function() {
            const wishlistItem = this.closest('.wishlist-item');
            const productName = wishlistItem.querySelector('h4').textContent;
            addToCart(productName);
        });
    });

    document.querySelectorAll('.wishlist-actions .btn-secondary').forEach(button => {
        button.addEventListener('click', function() {
            const wishlistItem = this.closest('.wishlist-item');
            if (confirm('정말로 위시리스트에서 삭제하시겠습니까?')) {
                wishlistItem.remove();
                showNotification('위시리스트에서 삭제되었습니다.');
            }
        });
    });

    // 배송지 관리 기능
    const addAddressBtn = document.querySelector('.add-address');
    const addressList = document.querySelector('.address-list');

    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', () => showAddressModal());
    }

    // 배송지 수정/삭제 이벤트 위임
    if (addressList) {
        addressList.addEventListener('click', function(e) {
            const addressCard = e.target.closest('.address-card');
            if (!addressCard) return;

            if (e.target.classList.contains('btn-secondary')) {
                if (e.target.textContent === '수정') {
                    showAddressModal(addressCard);
                } else if (e.target.textContent === '삭제') {
                    if (confirm('정말로 이 배송지를 삭제하시겠습니까?')) {
                        addressCard.remove();
                        showNotification('배송지가 삭제되었습니다.');
                    }
                }
            }
        });
    }

    // 계정 설정 기능
    const settingsForm = document.querySelector('.settings-form');
    const profileImageBtn = document.querySelector('.profile-image-upload button');


    // 계정 설정 저장
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 비밀번호 변경 확인
            const currentPassword = this.querySelector('input[placeholder="현재 비밀번호"]')?.value;
            const newPassword = this.querySelector('input[placeholder="새 비밀번호"]')?.value;
            const confirmPassword = this.querySelector('input[placeholder="새 비밀번호 확인"]')?.value;
            
            if (newPassword) {
                if (newPassword.length < 8) {
                    alert('비밀번호는 8자 이상이어야 합니다.');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    alert('새 비밀번호가 일치하지 않습니다.');
                    return;
                }
                
                if (!currentPassword) {
                    alert('현재 비밀번호를 입력해주세요.');
                    return;
                }
            }
            
            // 전화번호 형식 검증
            const phone = this.querySelector('input[type="tel"]')?.value;
            if (phone) {
                const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
                if (!phoneRegex.test(phone)) {
                    alert('올바른 전화번호 형식이 아닙니다.');
                    return;
                }
            }
            
            // 설정 저장 로직
            showNotification('계정 설정이 저장되었습니다.');
            
            // 비밀번호 입력 필드 초기화
            this.querySelectorAll('input[type="password"]').forEach(input => {
                input.value = '';
            });
        });
    }
}

// 리뷰 작성 모달
function showReviewModal(productName) {
    const modal = document.createElement('div');
    modal.className = 'review-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 30px;
            border-radius: 10px;
            width: 90%;
            max-width: 500px;
            text-align: center;
        ">
            <h3 style="margin-bottom: 20px;">${productName} 리뷰 작성</h3>
            <div class="rating-input" style="margin-bottom: 20px;">
                <span class="star" data-rating="1" style="font-size: 30px; color: #ddd; cursor: pointer;">★</span>
                <span class="star" data-rating="2" style="font-size: 30px; color: #ddd; cursor: pointer;">★</span>
                <span class="star" data-rating="3" style="font-size: 30px; color: #ddd; cursor: pointer;">★</span>
                <span class="star" data-rating="4" style="font-size: 30px; color: #ddd; cursor: pointer;">★</span>
                <span class="star" data-rating="5" style="font-size: 30px; color: #ddd; cursor: pointer;">★</span>
            </div>
            <textarea placeholder="리뷰를 작성해주세요" style="
                width: 100%;
                height: 100px;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin-bottom: 20px;
                box-sizing: border-box;
            "></textarea>
            <div class="modal-actions">
                <button class="btn-secondary cancel" style="
                    padding: 10px 20px;
                    margin-right: 10px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 5px;
                    cursor: pointer;
                ">취소</button>
                <button class="btn-primary submit" style="
                    padding: 10px 20px;
                    border: none;
                    background: #007bff;
                    color: white;
                    border-radius: 5px;
                    cursor: pointer;
                ">작성하기</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 별점 선택 기능
    const stars = modal.querySelectorAll('.star');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = this.dataset.rating;
            stars.forEach(s => {
                s.style.color = s.dataset.rating <= selectedRating ? '#ffd700' : '#ddd';
            });
        });
        
        star.addEventListener('mouseover', function() {
            const rating = this.dataset.rating;
            stars.forEach(s => {
                s.style.color = s.dataset.rating <= rating ? '#ffd700' : '#ddd';
            });
        });
        
        star.addEventListener('mouseout', function() {
            stars.forEach(s => {
                s.style.color = s.dataset.rating <= selectedRating ? '#ffd700' : '#ddd';
            });
        });
    });
    
    // 모달 닫기
    modal.querySelector('.cancel').addEventListener('click', () => {
        modal.remove();
    });
    
    // 배경 클릭으로 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // 리뷰 제출
    modal.querySelector('.submit').addEventListener('click', () => {
        const reviewText = modal.querySelector('textarea').value;
        if (selectedRating === 0) {
            alert('별점을 선택해주세요.');
            return;
        }
        if (!reviewText.trim()) {
            alert('리뷰 내용을 작성해주세요.');
            return;
        }
        
        // 리뷰 추가 로직
        addReview(productName, selectedRating, reviewText);
        modal.remove();
    });
}

// 리뷰 추가 함수
function addReview(productName, rating, content) {
    const reviewList = document.querySelector('.review-list');
    if (!reviewList) return;
    
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    reviewCard.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        background: white;
    `;
    
    reviewCard.innerHTML = `
        <div class="review-header" style="display: flex; align-items: center; margin-bottom: 10px;">
            <img src="https://via.placeholder.com/50" alt="상품 이미지" style="width: 50px; height: 50px; margin-right: 15px; border-radius: 5px;">
            <div class="review-info">
                <h4 style="margin: 0; margin-bottom: 5px;">${productName}</h4>
                <div class="rating" style="color: #ffd700;">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div>
            </div>
        </div>
        <p class="review-content" style="margin-bottom: 10px; line-height: 1.5;">${content}</p>
        <div class="review-actions">
            <button class="btn-secondary" style="
                padding: 5px 15px;
                margin-right: 10px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            ">수정</button>
            <button class="btn-secondary" style="
                padding: 5px 15px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            ">삭제</button>
        </div>
    `;
    
    reviewList.insertBefore(reviewCard, reviewList.firstChild);
    showNotification('리뷰가 작성되었습니다.');
}

// 배송지 모달
function showAddressModal(existingAddress = null) {
    showNotification('배송지 관리 기능은 준비 중입니다.', 'info');
}

// 장바구니 추가 함수
function addToCart(productName) {
    // 장바구니 아이콘 업데이트
    const cartIcon = document.querySelector('a[href="#cart"]');
    if (cartIcon) {
        const currentCount = parseInt(cartIcon.querySelector('.cart-count')?.textContent || '0');
        let countElement = cartIcon.querySelector('.cart-count');
        if (!countElement) {
            countElement = document.createElement('span');
            countElement.className = 'cart-count';
            cartIcon.appendChild(countElement);
        }
        countElement.textContent = currentCount + 1;
    }
    
    // 알림 표시
    showNotification(`${productName}이(가) 장바구니에 추가되었습니다.`);
}

// 알림 표시 함수
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.app-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `app-toast app-toast-${type}`;
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

// 스크롤 시 네비게이션 바 스타일 변경
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.backgroundColor = 'white';
        }
    }
});