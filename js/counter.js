
let visitorCount = 0;

function initVisitorCounter() {
    const counterElement = document.getElementById('visitorCounter');
    
    if (!counterElement) return;
    
    const savedCount = localStorage.getItem('visitorCount');
    if (savedCount) {
        visitorCount = parseInt(savedCount);
    }
    
    updateCounterDisplay(counterElement, visitorCount);
    
    increaseVisitorCount();
    
    setInterval(() => {
        increaseVisitorCount();
        updateCounterDisplay(counterElement, visitorCount);
    }, 5000);
}

function increaseVisitorCount() {
    const  1; // 1-6 новых посетителей
    visitorCount += newVisitors;
    
    localStorage.setItem('visitorCount', visitorCount.toString());
}

function updateCounterDisplay(element, count) {
    const formattedCount = count.toLocaleString('ru-RU');
    
    element.style.transform = 'scale(1.1)';
    element.style.color = '#ff6659';
    element.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        element.textContent = formattedCount;
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 300);
}

document.addEventListener('DOMContentLoaded', initVisitorCounter);