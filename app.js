// app.js - Simple Link Tracker (localStorage only)

// Initialize counters
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App initialized');
  
  // Load click counts
  loadClickCounts();
  
  // Add click listeners
  const links = document.querySelectorAll('.link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const linkId = link.dataset.id;
      incrementClick(linkId);
    });
  });
  
  // Copy button
  const copyBtn = document.getElementById('copyBtn');
  copyBtn.addEventListener('click', copyUrl);
});

// Load click counts from localStorage
function loadClickCounts() {
  const links = document.querySelectorAll('.link');
  links.forEach(link => {
    const linkId = link.dataset.id;
    const count = getClickCount(linkId);
    const counter = link.querySelector('.counter');
    counter.textContent = count;
  });
}

// Get click count for a link
function getClickCount(linkId) {
  const counts = JSON.parse(localStorage.getItem('linkClicks') || '{}');
  return counts[linkId] || 0;
}

// Increment click count
function incrementClick(linkId) {
  const counts = JSON.parse(localStorage.getItem('linkClicks') || '{}');
  counts[linkId] = (counts[linkId] || 0) + 1;
  localStorage.setItem('linkClicks', JSON.stringify(counts));
  
  // Update display
  const link = document.querySelector(`[data-id="${linkId}"]`);
  const counter = link.querySelector('.counter');
  counter.textContent = counts[linkId];
  
  console.log(`✅ Click tracked: ${linkId} = ${counts[linkId]}`);
}

// Copy URL to clipboard
async function copyUrl() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById('copyBtn');
    const originalText = btn.textContent;
    btn.textContent = '✅ Kopiert!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (err) {
    alert('Fehler beim Kopieren: ' + err);
  }
}