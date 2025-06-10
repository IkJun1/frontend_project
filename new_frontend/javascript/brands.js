// 브랜드 검색 기능 (수정된 버전)
const brandSearch = document.getElementById('brandSearch');
const brandCards = document.querySelectorAll('.brand-card');

brandSearch.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    let visibleCount = 0; // 보이는 카드 개수 추적
    
    brandCards.forEach(card => {
        const brandName = card.querySelector('h3').textContent.toLowerCase();
        const brandDesc = card.querySelector('p').textContent.toLowerCase();
        
        if (brandName.includes(searchTerm) || brandDesc.includes(searchTerm)) {
            card.style.display = 'block';
            visibleCount++; // 보이는 카드 개수 증가
        } else {
            card.style.display = 'none';
        }
    });
    
    // 검색 결과 메시지 처리
    handleSearchResults(visibleCount, searchTerm);
});

// 검색 결과 메시지 처리 함수 (새로 추가)
function handleSearchResults(visibleCount, searchTerm) {
    // 기존 메시지 제거
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 검색어가 있고 결과가 없을 때만 메시지 표시
    if (searchTerm.trim() !== '' && visibleCount === 0) {
        const message = document.createElement('div');
        message.className = 'no-results-message';
        message.innerHTML = `
            <div class="no-results-content">
                <i class="fas fa-search"></i>
                <h3>찾으려는 브랜드가 없습니다</h3>
                <p>"${searchTerm}"에 대한 검색 결과가 없습니다.</p>
                <p>다른 키워드로 검색해보세요.</p>
            </div>
        `;
        
        // 스타일 적용
        Object.assign(message.style, {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            textAlign: 'center',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            margin: '20px 0',
            padding: '40px 20px'
        });
        
        // 브랜드 그리드 컨테이너 찾아서 메시지 삽입
        const brandGrid = document.querySelector('.brand-grid') || document.querySelector('.brands-container');
        if (brandGrid) {
            brandGrid.appendChild(message);
        }
    }
}

// 카테고리 필터링 기능 (수정된 버전)
const categoryButtons = document.querySelectorAll('.category-btn');

categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
        // 활성화된 버튼 스타일 변경
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const category = this.dataset.category;
        let visibleCount = 0; // 보이는 카드 개수 추적
        
        brandCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                visibleCount++; // 보이는 카드 개수 증가
            } else {
                card.style.display = 'none';
            }
        });
        
        // 카테고리 필터링 결과 메시지 처리
        handleCategoryResults(visibleCount, category);
        
        // 검색창 초기화
        if (brandSearch) {
            brandSearch.value = '';
        }
    });
});

// 카테고리 필터링 결과 메시지 처리 함수 (새로 추가)
function handleCategoryResults(visibleCount, category) {
    // 기존 메시지 제거
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 'all' 카테고리가 아니고 결과가 없을 때만 메시지 표시
    if (category !== 'all' && visibleCount === 0) {
        const categoryName = getCategoryName(category);
        const message = document.createElement('div');
        message.className = 'no-results-message';
        message.innerHTML = `
            <div class="no-results-content">
                <i class="fas fa-tags"></i>
                <h3>해당 카테고리에 브랜드가 없습니다</h3>
                <p>"${categoryName}" 카테고리에는 현재 등록된 브랜드가 없습니다.</p>
                <p>다른 카테고리를 선택해보세요.</p>
            </div>
        `;
        
        // 스타일 적용
        Object.assign(message.style, {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            textAlign: 'center',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            margin: '20px 0',
            padding: '40px 20px'
        });
        
        // 브랜드 그리드 컨테이너 찾아서 메시지 삽입
        const brandGrid = document.querySelector('.brand-grid') || document.querySelector('.brands-container');
        if (brandGrid) {
            brandGrid.appendChild(message);
        }
    }
}

// 카테고리 이름 변환 함수 (새로 추가)
function getCategoryName(category) {
    const categoryNames = {
        'fashion': '패션',
        'beauty': '뷰티',
        'lifestyle': '라이프스타일',
        'sports': '스포츠',
        'luxury': '럭셔리',
        'streetwear': '스트릿웨어'
    };
    return categoryNames[category] || category;
}

// 브랜드 카드 클릭 이벤트
brandCards.forEach(card => {
    card.addEventListener('click', function() {
        const brandName = this.querySelector('h3').textContent;
        // 브랜드 상세 페이지로 이동
        window.location.href = `brand-detail.html?brand=${encodeURIComponent(brandName)}`;
    });
});

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

// 모바일 메뉴 토글
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuButton && navLinks) {
    menuButton.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// 검색 기능 (수정된 버전)
const searchIcon = document.querySelector('a[href="#search"]');
if (searchIcon) {
    searchIcon.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 기존 검색 컨테이너가 있으면 제거
        const existingSearchContainer = document.querySelector('.search-container');
        if (existingSearchContainer) {
            existingSearchContainer.remove();
            return;
        }
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '브랜드 검색';
        searchInput.className = 'search-input';
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.appendChild(searchInput);
        
        // 스타일 적용
        Object.assign(searchContainer.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '9999'
        });
        
        Object.assign(searchInput.style, {
            padding: '15px 20px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '25px',
            width: '400px',
            maxWidth: '90vw',
            textAlign: 'center',
            outline: 'none'
        });
        
        document.body.appendChild(searchContainer);
        searchInput.focus();
        
        // 검색 입력 이벤트
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            let visibleCount = 0;
            
            brandCards.forEach(card => {
                const brandName = card.querySelector('h3').textContent.toLowerCase();
                const brandDesc = card.querySelector('p').textContent.toLowerCase();
                
                if (brandName.includes(searchTerm) || brandDesc.includes(searchTerm)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            handleSearchResults(visibleCount, searchTerm);
        });
        
        // 컨테이너 클릭 시 닫기
        searchContainer.addEventListener('click', function(e) {
            if (e.target === searchContainer) {
                searchContainer.remove();
            }
        });
        
        // ESC 키로 닫기
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                searchContainer.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
    });
}