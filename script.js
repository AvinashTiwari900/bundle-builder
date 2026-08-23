const navButtons = document.querySelectorAll('.nav-item, .mobile-item');
const screens = document.querySelectorAll('.screen');
const modal = document.getElementById('auth-modal');
const loginButton = document.querySelector('.login-btn');
const toggleButton = document.querySelector('.toggle-btn');
const switchBadge = document.querySelector('.switch');

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.screen;
    screens.forEach((screen) => {
      screen.classList.toggle('active', screen.id === target);
    });

    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.screen === target));
    document.querySelectorAll('.mobile-item').forEach((item) => item.classList.toggle('active', item.dataset.screen === target));
  });
});

loginButton?.addEventListener('click', () => {
  modal.classList.remove('active');
  const dashboard = document.getElementById('dashboard');
  screens.forEach((screen) => screen.classList.remove('active'));
  dashboard.classList.add('active');
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.screen === 'dashboard'));
  document.querySelectorAll('.mobile-item').forEach((item) => item.classList.toggle('active', item.dataset.screen === 'dashboard'));
});

toggleButton?.addEventListener('click', () => {
  const enabled = switchBadge?.classList.toggle('off');
  switchBadge.textContent = enabled ? 'OFF' : 'ON';
  switchBadge.style.background = enabled ? 'rgba(245, 158, 11, 0.12)' : 'rgba(20,184,123,0.12)';
  switchBadge.style.color = enabled ? '#f59e0b' : '#14b87b';
});

const otpInputs = Array.from(document.querySelectorAll('.otp-code input'));
otpInputs.forEach((input, index) => {
  input.addEventListener('input', (event) => {
    const currentValue = event.target.value.replace(/\D/g, '').slice(0, 1);
    event.target.value = currentValue;
    if (currentValue && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !event.target.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

const chatInput = document.querySelector('.chat-input-row input');
const chatButton = document.querySelector('.chat-input-row button');

chatButton?.addEventListener('click', () => {
  if (!chatInput || !chatInput.value.trim()) return;
  const message = document.createElement('div');
  message.className = 'message-row user-message';
  message.innerHTML = '<strong>You</strong><p>' + chatInput.value.trim() + '</p>';
  const chatPanel = document.querySelector('.chat-panel');
  chatPanel.insertBefore(message, chatPanel.querySelector('.chat-input-row'));
  chatInput.value = '';
});
