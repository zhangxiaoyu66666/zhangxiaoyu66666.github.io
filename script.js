document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('progress-bar');
    const loadingTextEl = document.getElementById('loading-text');
    const startGameBtn = document.getElementById('start-game-btn');
    const mainScreen = document.getElementById('main-screen');
    const particleHeartInteractionArea = document.getElementById('particle-heart-interaction-area');
    const canvas = document.getElementById('particle-heart-canvas');
    const ctx = canvas.getContext('2d');
    const loveYouText = document.getElementById('love-you-text');
    const loveLetterContent = document.getElementById('love-letter-content');
    const birthdayInput = document.getElementById('birthday-input');
    const submitBirthdayBtn = document.getElementById('submit-birthday-btn');
    const birthdayError = document.getElementById('birthday-error');
    const driftingBottleScreen = document.getElementById('drifting-bottle-screen');
    const bottleContainer = document.getElementById('bottle-container');
    const rewardsModule = document.getElementById('rewards-module');
    const closeRewardsBtn = document.getElementById('close-rewards-btn');
    const rewardsModuleList = document.getElementById('rewards-list');
    const redEnvelopeTotalDisplay = document.getElementById('red-envelope-total-display');
    const bottleContentModal = document.getElementById('bottle-content-modal');
    const closeBottleModalBtn = bottleContentModal.querySelector('.close-button');
    const bottleModalTitle = document.getElementById('bottle-modal-title');
    const bottleItemContent = document.getElementById('bottle-item-content');
    const bottleChatLogDisplayArea = document.getElementById('bottle-chat-log-display-area');
    const bottleChatMessagesContainer = bottleChatLogDisplayArea ? bottleChatLogDisplayArea.querySelector('.messages-container') : null;
    const backgroundMusic = document.getElementById('background-music');
    const musicPlayPauseBtn = document.getElementById('music-play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const musicTitleEl = document.getElementById('music-title');
    const musicArtistEl = document.getElementById('music-artist');
    const fallingItemsContainer = document.querySelector('.falling-items-container');
    const showRewardsBtn = document.getElementById('show-rewards-btn');
    const timeMachineGameScreen = document.getElementById('time-machine-game-screen');
    const favorabilityDisplay = document.getElementById('favorability-display');
    const wealthDisplay = document.getElementById('wealth-display');
    const reputationDisplay = document.getElementById('reputation-display');
    const storyParagraph = document.getElementById('story-paragraph');
    const optionsArea = document.getElementById('options-area');
    const attributeFeedbackArea = document.getElementById('attribute-feedback-area');
    const endingDisplayArea = document.getElementById('ending-display-area');
    const endingTitleEl = document.getElementById('ending-title');
    const endingDescriptionEl = document.getElementById('ending-description');
    const developerCommentEl = document.getElementById('developer-comment');
    const restartTimeMachineBtn = document.getElementById('restart-time-machine-btn');
    const bottlesOpenedCountDisplay = document.getElementById('bottles-opened-count');
    const enterTimeMachinePromptBtn = document.getElementById('enter-time-machine-prompt-btn');
let activeTypewriters = new Map(); // element -> currentTimeoutId
    // --- Game State Variables ---
    let particles = [];
    let fireflies = [];
    let animationFrameId = null;
    let heartIsExploding = false;
    let heartBaseScale = 10;
    let heartClipPath = new Path2D();
    let collectedRedEnvelopeTotal = 0;
    const totalBottles = 30;
    let bottleData = [];
    let openedBottles = 0;
    let playerStats = {
        favorability: 0,
        wealth: 0,
        reputation: 0,
        jishouWorkType: null,
        initialFavorabilityBeforeJishou: 0
    };
    let currentNodeId = '';
    let dailyInteractionCounter = 0;
    let timeMachineFlags = {
        metBeggarAndHelped: false,
        investedInChaozhen: false,
        jishouRemoteInvestSuccess: false
    };
    let fallingItemsInterval = null;

    // 立即显示加载屏幕
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
        loadingScreen.style.visibility = 'visible';
    }

    // --- Rewards Module Close Button ---
    if (closeRewardsBtn && rewardsModule && showRewardsBtn) {
        closeRewardsBtn.addEventListener('click', () => {
            rewardsModule.classList.add('hidden');
            showRewardsBtn.style.display = 'inline-block';
        });

        showRewardsBtn.addEventListener('click', () => {
            rewardsModule.classList.remove('hidden');
            showRewardsBtn.style.display = 'none';
        });
    }

    function createFallingItem() {
        if (!fallingItemsContainer) return;

        const item = document.createElement('div');
        item.classList.add('falling-item');
        const itemType = Math.random() < 0.65 ? 'heart' : 'ice-cream';

        if (itemType === 'heart') {
            item.classList.add('heart');
            item.textContent = '❤️';
        } else {
            item.classList.add('ice-cream');
            item.textContent = '🍨';
        }

        item.style.left = Math.random() * 98 + 'vw';
        item.style.animationDuration = (Math.random() * 6 + 7) + 's';
        item.style.fontSize = (Math.random() * 12 + 16) + 'px';
        item.style.opacity = Math.random() * 0.6 + 0.4;
        item.style.animationDelay = Math.random() * 5 + 's';

        fallingItemsContainer.appendChild(item);

        setTimeout(() => {
            if (item.parentNode) {
                item.remove();
            }
        }, parseFloat(item.style.animationDuration.replace('s', '')) * 1000 + parseFloat(item.style.animationDelay.replace('s', '')) * 1000 + 100);
    }

    // --- Music Player Logic ---
    function setupMusicPlayer() {
        if (musicTitleEl) musicTitleEl.textContent = "把回忆拼好给你";
        if (musicArtistEl) musicArtistEl.textContent = "王贰浪";
        if (musicPlayPauseBtn) musicPlayPauseBtn.addEventListener('click', togglePlayPause);
        if (backgroundMusic) {
            backgroundMusic.addEventListener('play', () => { if (playIcon) playIcon.style.display = 'none'; if (pauseIcon) pauseIcon.style.display = 'inline-block'; });
            backgroundMusic.addEventListener('pause', () => { if (playIcon) playIcon.style.display = 'inline-block'; if (pauseIcon) pauseIcon.style.display = 'none'; });
        }
    }
    function togglePlayPause() { if (backgroundMusic && backgroundMusic.paused) { backgroundMusic.play().catch(e => console.warn("Music play error:", e)); } else if (backgroundMusic) { backgroundMusic.pause(); } }
    setupMusicPlayer();

    // --- Particle Heart Logic ---
    function defineHeartShapePath(scale = 1) { const path = new Path2D(); const s = 100 * scale; path.moveTo(0, s * 0.3); path.bezierCurveTo(s * -0.35, s * -0.15, s * -0.8, s * 0.2, s * -0.8, s * 0.65); path.bezierCurveTo(s * -0.8, s * 1.0, s * -0.4, s * 1.35, 0, s * 1.7); path.bezierCurveTo(s * 0.4, s * 1.35, s * 0.8, s * 1.0, s * 0.8, s * 0.65); path.bezierCurveTo(s * 0.8, s * 0.2, s * 0.35, s * -0.15, 0, s * 0.3); path.closePath(); return path; }
    class Particle { constructor(x, y, w, h) { this.w = w; this.h = h; this.x = x; this.y = y; this.s = Math.random() * 2.8 + 1.6; this.vx = (Math.random() - .5) * .45; this.vy = (Math.random() - .5) * .45; this.o = Math.random() * .45 + .55; this.to = this.o; this.co = this.o; this.c = `rgba(255,${Math.floor(Math.random() * 60 + 100)},${Math.floor(Math.random() * 60 + 120)},${this.co})`; this.ts = Math.random() * .08 + .03; this.tp = Math.random() * Math.PI * 2; this.l = 140 + Math.random() * 100; this.il = this.l } update() { if (heartIsExploding) { this.x += this.vx; this.y += this.vy; this.o -= .03; this.s -= .08; if (this.s < 0) this.s = 0; this.co = this.o } else { this.x += this.vx; this.y += this.vy; if (this.l <= 0 || this.x < -this.s || this.x > this.w + this.s || this.y < -this.s || this.y > this.h + this.s) { this.x = Math.random() * this.w; this.y = Math.random() * this.h; this.vx = (Math.random() - .5) * .45; this.vy = (Math.random() - .5) * .45; this.o = Math.random() * .45 + .55; this.to = this.o; this.s = Math.random() * 2.8 + 1.6; this.l = this.il } this.tp += this.ts; const tF = (Math.sin(this.tp) + 1) / 2; this.co = this.to * (.4 + tF * .6); this.l-- } this.c = `rgba(255,${Math.floor(Math.random() * 60 + 100)},${Math.floor(Math.random() * 60 + 120)},${this.co})` } draw(c) { if (this.o > .01 && this.s > .1) { c.beginPath(); c.arc(this.x, this.y, this.s, 0, Math.PI * 2); c.fillStyle = this.c; c.shadowBlur = 10; c.shadowColor = this.c.replace(/[^,]+(?=\))/, '0.85'); c.fill(); c.shadowBlur = 0 } } }
    class Firefly { constructor(w, h) { this.w = w; this.h = h; this.x = Math.random() * w; this.y = Math.random() * h; this.s = Math.random() * 1.8 + 1; this.vx = (Math.random() - .5) * .7; this.vy = (Math.random() - .5) * .7; this.o = Math.random() * .4 + .3; this.to = this.o; this.co = this.o; this.c = `rgba(200,255,200,${this.co})`; this.fs = Math.random() * .12 + .06; this.fp = Math.random() * Math.PI * 2 } update() { this.x += this.vx; this.y += this.vy; if (this.x < -this.s) this.x = this.w + this.s; if (this.x > this.w + this.s) this.x = -this.s; if (this.y < -this.s) this.y = this.h + this.s; if (this.y > this.h + this.s) this.y = -this.s; this.fp += this.fs; const fF = (Math.sin(this.fp) + 1) / 2; this.co = this.to * (.25 + fF * .75); this.c = `rgba(200,255,200,${this.co})` } draw(c) { if (this.co > .01 && this.s > .1) { c.beginPath(); c.arc(this.x, this.y, this.s, 0, Math.PI * 2); c.fillStyle = this.c; c.shadowBlur = 9; c.shadowColor = this.c.replace(/[^,]+(?=\))/, '0.75'); c.fill(); c.shadowBlur = 0 } } }

    function initCanvasHeart() {
        if (!particleHeartInteractionArea || !canvas) { console.error("Canvas elements not found for heart."); return }
        canvas.width = particleHeartInteractionArea.clientWidth;
        canvas.height = particleHeartInteractionArea.clientHeight;
        if (canvas.width === 0 || canvas.height === 0) {
            console.warn("Canvas dimensions zero. Heart animation might not be visible.");
            return; // Important: if dimensions are 0, abort animation setup
        }
        const pNW = 200, pNH = 200; const sX = canvas.width / pNW, sY = canvas.height / pNH; heartBaseScale = Math.min(sX, sY) * .8; if (heartBaseScale < .35) heartBaseScale = .35; heartClipPath = defineHeartShapePath(heartBaseScale); particles = []; const nP = 2800; for (let i = 0; i < nP; i++) { particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, canvas.width, canvas.height)) } fireflies = []; const nF = 40; for (let i = 0; i < nF; i++) { fireflies.push(new Firefly(canvas.width, canvas.height)) } heartIsExploding = false; if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animateParticles(); // Start animation only if canvas has dimensions
    }

    function animateParticles() {
        if (!ctx || !canvas) return;
        // Optimization: if canvas dimensions are still 0 here, no point drawing.
        if (canvas.width === 0 || canvas.height === 0) {
             // This can happen if resize event made it zero after init
            if (animationFrameId) cancelAnimationFrame(animationFrameId); // Stop loop
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fireflies.forEach(f => { f.update(); f.draw(ctx) });
        ctx.save();
        if (!heartIsExploding) {
            const s_v = 100 * heartBaseScale; const tX = canvas.width / 2;
            const pVCYFO = s_v * .7; const tY = (canvas.height / 2) - pVCYFO;
            ctx.translate(tX, tY); ctx.clip(heartClipPath); ctx.translate(-tX, -tY);
        }
        let aP = 0; particles.forEach(p => { p.update(); p.draw(ctx); if (p.o > .01 && p.s > .1) aP++ }); ctx.restore();
        if (heartIsExploding && aP === 0) {
            cancelAnimationFrame(animationFrameId); animationFrameId = null;
            particleHeartInteractionArea.style.display = 'none';
            loveLetterContent.style.display = 'block'; // Make sure this has CSS to be visible
             if(loveLetterContent) { // Ensure it's styled to be visible
                loveLetterContent.style.opacity = '1';
                loveLetterContent.style.visibility = 'visible';
            }
            mainScreen.style.justifyContent = 'flex-start'; mainScreen.style.paddingTop = '5vh'; return
        }
        animationFrameId = requestAnimationFrame(animateParticles);
    }

    // --- Game Flow Control ---
    startGameBtn.addEventListener('click', () => {
        loadingScreen.style.opacity = '0';
        if (backgroundMusic && backgroundMusic.paused) {
            backgroundMusic.play().catch(e => console.warn("Music autoplay error:", e));
        }
        setTimeout(() => {
            loadingScreen.style.display = 'none';

            // --- CRUCIAL FIX: Make mainScreen visible before using its children's dimensions ---
            if (mainScreen) {
                mainScreen.style.opacity = '1';
                mainScreen.style.visibility = 'visible';
                mainScreen.style.display = 'flex';
            }
            // --- END FIX ---

            if (particleHeartInteractionArea) {
                particleHeartInteractionArea.style.display = 'flex';
                 // Ensure its opacity is 1 if it has its own independent opacity settings in CSS.
                 // By default, your CSS for #particle-heart-interaction-area doesn't set opacity: 0 initially,
                 // so this should be fine. Its transition applies on opacity *change*.
            }
            if (loveYouText) {
                loveYouText.style.opacity = '1';
            }

            initCanvasHeart(); // Now this should get proper dimensions

            // Start falling items
            if (fallingItemsContainer && !fallingItemsInterval) {
                for (let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) {
                    setTimeout(createFallingItem, Math.random() * 1500);
                }
                fallingItemsInterval = setInterval(createFallingItem, 1200);
            }
        }, 600);
    });

    if (particleHeartInteractionArea) {
        particleHeartInteractionArea.addEventListener('click', () => {
            if (backgroundMusic && backgroundMusic.paused) { backgroundMusic.play().catch(e => console.warn("Music play on click error:", e)) }
            if (heartIsExploding) return;
            heartIsExploding = true;
            particleHeartInteractionArea.classList.add('splitting');
            particles.forEach(p => { const s_v = 100 * heartBaseScale, pVCYFO = s_v * .7, eOTY = (canvas.height / 2) - pVCYFO, eCY = eOTY + pVCYFO, eCX = canvas.width / 2, ang = Math.atan2(p.y - eCY, p.x - eCX), spd = Math.random() * 12 + 9; p.vx = Math.cos(ang) * spd + (Math.random() - .5) * 4.5; p.vy = Math.sin(ang) * spd + (Math.random() - .5) * 4.5; p.l = 40 + Math.random() * 20 });
        });
    }

    if (submitBirthdayBtn) {
        submitBirthdayBtn.addEventListener('click', () => {
            if (fallingItemsInterval) {
                clearInterval(fallingItemsInterval);
                fallingItemsInterval = null;
                if (fallingItemsContainer) fallingItemsContainer.innerHTML = '';
            }

            if (rewardsModule && rewardsModule.classList.contains('hidden')) {
                rewardsModule.classList.remove('hidden');
                if (showRewardsBtn) showRewardsBtn.style.display = 'none';
            }
            if (birthdayInput.value === '0123') {
                if(birthdayError) birthdayError.style.display = 'none';
                if(mainScreen) mainScreen.style.display = 'none';
                if(driftingBottleScreen) driftingBottleScreen.style.display = 'flex';
                if (driftingBottleScreen) { // Ensure visibility if using transitions
                    driftingBottleScreen.style.opacity = '1';
                    driftingBottleScreen.style.visibility = 'visible';
                }
                initDriftingBottles();
            }
            else if (birthdayInput.value === '1917') {
                if(birthdayError) birthdayError.style.display = 'none';
                if(mainScreen) mainScreen.style.display = 'none';
                if(driftingBottleScreen) driftingBottleScreen.style.display = 'none';
                if(timeMachineGameScreen) timeMachineGameScreen.style.display = 'flex';
                 if (timeMachineGameScreen) { // Ensure visibility
                    timeMachineGameScreen.style.opacity = '1';
                    timeMachineGameScreen.style.visibility = 'visible';
                }
                startNewTimeMachineGame();
            }
            else {
                if(birthdayError) birthdayError.style.display = 'block';
                if(birthdayInput) birthdayInput.value = '';
            }
        });
    }

    // --- Drifting Bottle Logic ---
    function generateRedEnvelopeAmounts(count, totalSum) { let amounts = []; let currentSum = 0; for (let i = 0; i < count - 1; i++) { let maxPossible = totalSum - currentSum - (count - 1 - i); if (maxPossible <= 1) maxPossible = 1.1; let amount = parseFloat((Math.random() * (maxPossible - 1) + 1).toFixed(2)); if (currentSum + amount > totalSum - (count - 1 - i)) { amount = parseFloat((totalSum - currentSum - (count - 1 - i)).toFixed(2)); } if (amount < 0.01) amount = 0.01; amounts.push(amount); currentSum += amount; } amounts.push(parseFloat((totalSum - currentSum).toFixed(2))); return amounts.sort(() => Math.random() - 0.5); }
    function initDriftingBottles() {
        if(bottleContainer) bottleContainer.innerHTML = '';
        bottleData = []; collectedRedEnvelopeTotal = 0;
        updateRedEnvelopeTotalDisplay();
        if(rewardsModuleList) rewardsModuleList.innerHTML = '';
        openedBottles = 0;
        updateOpenedBottlesCount();
        if(enterTimeMachinePromptBtn) enterTimeMachinePromptBtn.style.display = 'none';
        if (rewardsModule) rewardsModule.classList.remove('hidden');
        if (showRewardsBtn) showRewardsBtn.style.display = 'none';
        let items = [];
        const redEnvelopeAmounts = generateRedEnvelopeAmounts(15, 52);
        for (let i = 0; i < 15; i++) { items.push({ type: 'red_envelope', amount: redEnvelopeAmounts[i], content: `恭喜！你获得了一个红包，金额：${redEnvelopeAmounts[i].toFixed(2)}元！`, opened: false }); }
        const ticketDestination = Math.random() < 0.5 ? '内蒙古' : '云南';
        items.push({ type: 'plane_ticket', destination: ticketDestination, travelers: "张珊珊和章笑语", content: `天大的惊喜！一张为 张珊珊和章笑语 前往 ${ticketDestination} 的双人机票！`, image: '', opened: false });

        const predefinedChatConversations = [
            [{ sender: "me", type: "text", content: "问个问题，什么样的礼物对你最有意义" }, { sender: "her", type: "text", content: "贵的不一定好，但是如果有意义的话，就是你看到那个东西，你就能知道这件事是发生于什么时候。这样才会有那种回忆的过程" }],
            [{ sender: "her", type: "text", content: "我一直记住你的好啊" }, { sender: "me", type: "text", content: "我也一直记住你的好啊" }],
            [{ sender: "her", type: "text", content: "于途和我感情深" }, { sender: "me", type: "text", content: "感情深就好！" }],
            [{ sender: "her", type: "text", content: "我能当皇后吗，皇上吉祥！ 皇上以后要专心搞事业，不要天天只想着皇后 我要做一个懂事的皇后" }, { sender: "me", type: "text", content: "朕封你为皇后，以后后宫就是你的天下，你想干嘛就干嘛" }, { sender: "her", type: "text", content: "那皇上不要冷落我，不要把我打入冷宫 " }, { sender: "me", type: "text", content: "好的呢，不会的" }],
            [{ sender: "her", type: "text", content: "我有时候也羡慕恋爱啊，但我觉得我不配，我谈恋爱，我就喜欢作死。" }, { sender: "me", type: "text", content: "马后炮：珊珊你可以永远在我这里作死~" }, { sender: "me", type: "text", content: "你完全配得上一段被爱的爱情" }, { sender: "me", type: "text", content: "毕竟你是我最喜欢的人。" }],
            [{ sender: "me", type: "text", content: "还有40分钟就2025了" }, { sender: "her", type: "text", content: "是的呢" }, { sender: "me", type: "text", content: "元旦快乐！" }, { sender: "her", type: "text", content: "元旦快乐！" }],
            [{ sender: "her", type: "text", content: "好，高冷哥又回来了" }, { sender: "me", type: "text", content: "没有啊,我在走路" }, { sender: "her", type: "text", content: "我发现我瘦了点，我锁骨都出来了（图片）" }],
            [{ sender: "me", type: "text", content: "真不可兼得的话我选择人民币，因为有人民币才能给你更好的生活 不过目前来看可以兼得嘿嘿嘿 [表情包]" }, { sender: "her", type: "text", content: "不可以" }, { sender: "me", type: "text", content: "不可以的话，就要你了 你陪我吃泡面吧 [表情包]" }],
            [{ sender: "me", type: "text", content: "《遇张珊珊于肯德基作》\n金门初启玉人来，雪魄冰魂照九垓。\n一霎眼波融铁骨，烟霞满地绊青苔。" }, { sender: "her", type: "text", content: "…… 文化人 就是不一样 出口成章 出类拔萃" }, { sender: "me", type: "text", content: "见到你的时候腿坐久了有点麻，然后又看到你这么美，直接给我腿干软了[破涕为笑]" }, { sender: "her", type: "text", content: "…… 哪里有那么夸张" }, { sender: "me", type: "text", content: "这叫生理性喜欢好不好，我见其他人腿都不软的[捂脸]" }],
            [{ sender: "me", type: "text", content: "老婆老婆老婆，我滚了" }, { "sender": "her", "type": "text", "content": "神经病" }, { "sender": "me", "type": "text", "content": "神经病来亲你了 [表情包]" }, { "sender": "her", "type": "text", "content": "…… 你好癫" }],
            [{ "sender": "me", "type": "text", "content": "我未来老婆的电话怎么可能不记得呢" }, { "sender": "her", "type": "text", "content": "现在立刻马上打出我的电话" }, { "sender": "me", "type": "text", "content": "xxxxxxxxxx(隐私自行脑补）" }, { "sender": "her", "type": "text", "content": "你复制粘贴" }, { "sender": "me", "type": "text", "content": "没有😭" }, { "sender": "her", "type": "text", "content": "真的嘛" }, { "sender": "me", "type": "text", "content": "比珍珠还真" }, { "sender": "her", "type": "text", "content": "好的呢" }, { "sender": "me", "type": "text", "content": "所以你承认你是我老婆了？" }],
            [{ "sender": "me", "type": "text", "content": "唉我神算子遇到你翻车了" }, { "sender": "her", "type": "text", "content": "你就是骗子 还神算子" }, { "sender": "me", "type": "text", "content": "是的，我专门骗你这种纯情少女 " }],
            [{ "sender": "me", "type": "text", "content": "你跑路跑到天涯海角也没事，月老已经牵绳子了 [表情包]" }, { "sender": "her", "type": "text", "content": "没有啊 哪里有 没看见" }],
            [{ "sender": "her", "type": "text", "content": "你儿子太麻烦了，上车又要搬上搬下的 婴儿车" }, { "sender": "me", "type": "text", "content": "你这输入法该换了，吓我一跳，我还以为现在是2038年了,引用:s.：你儿子太麻烦了，上车又要搬上搬下的" }, { "sender": "her", "type": "text", "content": "哈哈哈" }, { "sender": "me", "type": "text", "content": "请问从未来来的姐姐，我儿子可爱吗" }, { "sender": "her", "type": "text", "content": "你儿子肯定可爱呀" }],
        ];

        const neededChatBottles = totalBottles - items.length;
        for (let i = 0; i < neededChatBottles; i++) {
            const conversationLog = predefinedChatConversations[i % predefinedChatConversations.length];
            items.push({ type: 'chat_log', log: conversationLog, opened: false });
        }

        bottleData = items.sort(() => 0.5 - Math.random());
        const numCols = 6; const numRows = 5;
        const cellWidthPercent = 100 / numCols; const cellHeightPercent = 100 / numRows;
        const bottleVisualWidthPercentOfCell = 0.4; const bottleVisualHeightPercentOfCell = 0.5;

        bottleData.forEach((data, index) => {
            const bottleEl = document.createElement('div'); bottleEl.classList.add('bottle');
            bottleEl.textContent = '🍾'; bottleEl.dataset.index = index;
            bottleEl.style.animationDelay = `${(index % numCols) * 0.2 + (Math.floor(index / numCols)) * 0.3}s`;
            bottleEl.addEventListener('click', handleBottleClick);
            const currentCol = index % numCols; const currentRow = Math.floor(index / numCols);
            const randomOffsetXInCell = Math.random() * (1 - bottleVisualWidthPercentOfCell);
            const randomOffsetYInCell = Math.random() * (1 - bottleVisualHeightPercentOfCell);
            const finalLeftPercent = (currentCol + randomOffsetXInCell) * cellWidthPercent;
            const finalTopPercent = (currentRow + randomOffsetYInCell) * cellHeightPercent;
            bottleEl.style.left = `${finalLeftPercent}%`; bottleEl.style.top = `${finalTopPercent}%`;
            bottleEl.style.transform = `rotate(${(Math.random() - 0.5) * 15}deg)`;
            if (bottleContainer) bottleContainer.appendChild(bottleEl);
        });
    }

    function handleBottleClick(event) {
        const bottleEl = event.currentTarget; const index = parseInt(bottleEl.dataset.index);
        const data = bottleData[index];
        if (!data) return; // Guard against undefined data

        if (data.opened && !bottleEl.classList.contains('opened-bottle')) { bottleEl.classList.add('opened-bottle');}
        if (bottleEl.classList.contains('opened-bottle')) { openBottleContentModal(data); return; }

        data.opened = true;
        bottleEl.classList.add('opened-bottle');

        openedBottles++;
        updateOpenedBottlesCount();
        openBottleContentModal(data);

        if (data.type === 'red_envelope') { collectedRedEnvelopeTotal += data.amount; updateRedEnvelopeTotalDisplay(); addRewardToList(`红包: ${data.amount.toFixed(2)}元`); }
        else if (data.type === 'plane_ticket') { addRewardToList(`惊喜机票: 前往${data.destination}`); }

        if (openedBottles >= totalBottles) {
            if (bottleContainer && bottleContainer.querySelector('.all-bottles-opened-message')) return;
            const allOpenedMsg = document.createElement('p'); allOpenedMsg.textContent = "所有漂流瓶都已探寻完毕！";
            allOpenedMsg.className = 'all-bottles-opened-message';
            allOpenedMsg.style.cssText = "color:white; text-align:center; width:100%; font-size:1.2em; margin-top:10px; text-shadow: 0 1px 3px #000;";
            const bottleMessageEl = document.getElementById('bottle-message');
            if (bottleMessageEl && bottleMessageEl.parentNode) {
                bottleMessageEl.parentNode.insertBefore(allOpenedMsg, bottleMessageEl.nextSibling);
            } else if (driftingBottleScreen) { driftingBottleScreen.appendChild(allOpenedMsg); }
            if (enterTimeMachinePromptBtn) enterTimeMachinePromptBtn.style.display = 'block';
        }
    }
    function updateOpenedBottlesCount() { if (bottlesOpenedCountDisplay) bottlesOpenedCountDisplay.textContent = openedBottles; }

    if(enterTimeMachinePromptBtn) {
        enterTimeMachinePromptBtn.addEventListener('click', () => {
            if (driftingBottleScreen) driftingBottleScreen.style.display = 'none';
            const allOpenedMsg = driftingBottleScreen ? driftingBottleScreen.querySelector('.all-bottles-opened-message') : null;
            if(allOpenedMsg) allOpenedMsg.remove();
            if (timeMachineGameScreen) {
                timeMachineGameScreen.style.display = 'flex';
                timeMachineGameScreen.style.opacity = '1'; // Ensure visibility
                timeMachineGameScreen.style.visibility = 'visible';
            }
            startNewTimeMachineGame();
        });
    }


    function openBottleContentModal(data) {
        if (!bottleChatLogDisplayArea || !bottleChatMessagesContainer) {
            console.error("Chat log display elements not found!");
            if (bottleModalTitle) bottleModalTitle.textContent = "错误";
            if (bottleItemContent) bottleItemContent.innerHTML = "<p>抱歉，加载聊天记录时出现问题。</p>";
            if (bottleContentModal) bottleContentModal.style.display = 'flex';
            return;
        }

        if (bottleModalTitle) bottleModalTitle.textContent = "漂流瓶的秘密";
        if (bottleItemContent) bottleItemContent.innerHTML = '';
        bottleChatLogDisplayArea.style.display = 'none';
        bottleChatMessagesContainer.innerHTML = '';

        if (data.type === 'red_envelope') {
            if (bottleModalTitle) bottleModalTitle.textContent = "红包惊喜！";
            if (bottleItemContent) bottleItemContent.innerHTML = `<p class="red-envelope">${data.content}</p>`;
        } else if (data.type === 'plane_ticket') {
            if (bottleModalTitle) bottleModalTitle.textContent = "天降大礼！";
            if (bottleItemContent) bottleItemContent.innerHTML = `<p>${data.content}</p>${data.image ? `<img src="${data.image}" alt="飞机票图片">` : ''}<p style="font-size:0.8em; color: #ccc;">请联系管理员兑换此奖励</p>`;
        } else if (data.type === 'chat_log') {
            if (bottleModalTitle) bottleModalTitle.textContent = "互动记录";
            if (!data.log || !Array.isArray(data.log)) {
                console.error("Invalid chat log data:", data);
                if (bottleItemContent) bottleItemContent.innerHTML = "<p>抱歉，聊天记录数据格式错误。</p>";
            } else {
                bottleChatLogDisplayArea.style.display = 'block';
                data.log.forEach(msg => {
                    if (!msg || typeof msg.sender === 'undefined' || typeof msg.type === 'undefined' || typeof msg.content === 'undefined') {
                        console.warn("Skipping malformed message:", msg); return;
                    }
                    const messageBubble = document.createElement('div');
                    messageBubble.classList.add('message-bubble');
                    messageBubble.classList.add(msg.sender === 'me' ? 'me' : 'her');
                    if (msg.type === 'text') {
                        const p = document.createElement('p'); p.textContent = msg.content; messageBubble.appendChild(p);
                    } else if (msg.type === 'image') {
                        const img = document.createElement('img'); img.src = msg.content; img.alt = msg.caption || '聊天图片'; messageBubble.appendChild(img);
                        if (msg.caption) { const capP = document.createElement('p'); capP.classList.add('image-caption'); capP.textContent = msg.caption; messageBubble.appendChild(capP); }
                    }
                    bottleChatMessagesContainer.appendChild(messageBubble);
                });
                if (bottleChatMessagesContainer) bottleChatMessagesContainer.scrollTop = bottleChatMessagesContainer.scrollHeight;
            }
        }
        if (bottleContentModal) {
            bottleContentModal.style.display = 'flex';
            const modalContentEl = bottleContentModal.querySelector('.modal-content');
            if (modalContentEl) { modalContentEl.style.animation = 'none'; void modalContentEl.offsetWidth; modalContentEl.style.animation = 'fadeInModal 0.4s ease-out forwards'; }
        }
    }
    if (closeBottleModalBtn) closeBottleModalBtn.addEventListener('click', () => { if (bottleContentModal) bottleContentModal.style.display = 'none'; });
    if (bottleContentModal) bottleContentModal.addEventListener('click', (event) => { if (event.target === bottleContentModal) { bottleContentModal.style.display = 'none'; } });
    function updateRedEnvelopeTotalDisplay() { if (redEnvelopeTotalDisplay) redEnvelopeTotalDisplay.textContent = `红包总金额: ${collectedRedEnvelopeTotal.toFixed(2)} 元`; }
    function addRewardToList(rewardText) { if (rewardsModuleList) { const li = document.createElement('li'); li.textContent = rewardText; rewardsModuleList.appendChild(li); rewardsModuleList.scrollTop = rewardsModuleList.scrollHeight; } }

    // --- Time Machine Game Logic ---
    const dailyEventsTemplates = {
        'ask_buy_milk_tea': { type: 'daily_interaction', text: "路过一家看起来很不错的奶茶店，朝真似乎也有些口渴。我要不要主动提出给他买一杯？", options: [{ text: "“朝真，我请你喝奶茶吧！你喜欢什么口味的？”", favorability_change: 1, next_is_pool_or_major: true }, { text: "（算了，他想喝自己会买的。）", favorability_change: -1, next_is_pool_or_major: true }] },
        'ask_share_daily': { type: 'daily_interaction', text: "今天遇到一件很有趣的事情，要不要主动和朝真分享呢？", options: [{ text: "“朝真朝真，跟你说件好玩的事……”", favorability_change: 1, next_is_pool_or_major: true }, { text: "（还是不打扰他了，他可能在忙。）", favorability_change: -1, next_is_pool_or_major: true }] },
        'ask_see_movie': { type: 'daily_interaction', text: "最近上映了一部口碑不错的电影，朝真好像也提过有兴趣。我要不要约他一起去看？", options: [{ text: "“朝真，那部新电影听说很好看，我们一起去吧？”", favorability_change: 1, next_is_pool_or_major: true }, { text: "（还是等他约我吧……）", favorability_change: 0, next_is_pool_or_major: true }] },
        'jishou_daily_call_parents': { type: 'daily_interaction', text: "在吉首的日子有些平淡，晚饭后，我想起了远方的爸妈。要不要给他们打个电话聊聊天？", options: [{ text: "给爸妈打电话，报个平安，聊聊家常。", reputation_change: 1, next_is_pool_or_major: true }, { text: "（算了，他们可能也忙，下次再说吧。）", next_is_pool_or_major: true }] },
        'jishou_daily_read_book': { type: 'daily_interaction', text: "幼儿园下班后，天色还早。我是看会儿专业相关的书籍充实自己，还是刷刷短视频放松一下呢？", options: [{ text: "看书学习，为孩子们提供更好的教育。", reputation_change: 1, next_is_pool_or_major: true }, { text: "刷短视频放松一下，劳逸结合嘛。", next_is_pool_or_major: true }] },
        'jishou_daily_chaozhen_thought': { type: 'daily_interaction', text: "夜深人静，批改完孩子们的作业，望着窗外的月亮，我不禁想起了在长沙的朝真，不知道他现在怎么样了...", options: [{ text: "（默默思念，希望他一切都好，并给他发条不痛不痒的问候消息。）", favorability_change: 1, next_is_pool_or_major: true, feedbackText: "你给朝真发了条消息，他很快回复了你，你们简单聊了几句。好感度+1❤️" }, { text: "（摇摇头，不去想了，过好自己的生活吧。）", favorability_change: -1, next_is_pool_or_major: true }] },
        'jishou_private_career_boost': { type: 'daily_interaction', text: "自从在薪资不错的私立幼儿园工作后，我更加努力。最近园长似乎对我的表现很满意，好像有提拔我或委以重任的机会...", options: [{ text: "抓住机会，全力以赴！", action: () => { if (playerStats.jishouWorkType === 'private') { playerStats.wealth += 1; playerStats.reputation += 1; } }, feedbackText: () => playerStats.jishouWorkType === 'private' ? '你的努力和才华得到了回报！财富+1💰 声望+1✨' : '虽然你很努力，但这似乎是私立幼儿园特有的机会。', next_is_pool_or_major: true }, { text: "还是稳妥点，慢慢来吧。", next_is_pool_or_major: true }] },
        'jishou_new_year_chaozhen_visit': { type: 'daily_interaction', text: "春节到了，听说朝真也回吉首过年。街上张灯结彩，年味十足。我要不要约他出来聚聚，聊聊近况呢？", options: [{ text: "主动约他见面，叙叙旧。", favorability_change: 1, feedbackText: "你联系了朝真，他似乎有些意外，但还是赴约了。你们聊了许多往事和近况，空气中有些微妙的情愫。好感度+1❤️", next_is_pool_or_major: true }, { text: "还是算了吧，他可能忙着陪家人，不打扰了。", favorability_change: -1, feedbackText: "你没有联系朝真，这个春节你们没有交集。彼此的距离似乎又远了一些。好感度-1💔", next_is_pool_or_major: true }] },
        'jishou_learn_finance_invest_market': { type: 'daily_interaction', text: "工作之余，我接触到一些关于理财和投资的知识，想着或许能让生活多一份保障和可能。要不要学习一下，并尝试进行一些小额投资呢？", options: [{ text: "学习理财，尝试投资股市/基金。", wealth_change: 1, reputation_change: 1, feedbackText: "你认真学习了金融知识，并谨慎地进行了一些市场投资，略有斩获。财富+1💰 声望+1✨", next_is_pool_or_major: true }, { text: "这些太复杂了，风险也大，还是算了。", feedbackText: "你觉得投资风险太大，还是选择了更稳妥的生活方式。", next_is_pool_or_major: true }] },
        'jishou_invest_chaozhen_remotely': { type: 'daily_interaction', text: () => `虽然分隔两地，但偶尔和朝真联系时，得知他的自动化烧烤项目似乎很有前景，但也面临资金压力。我手头有些积蓄 (当前财富: ${'💰'.repeat(Math.max(0, playerStats.wealth))})，如果财富达到2点，要不要考虑远程支持一下他的事业呢？`, options: [{ text: "支持朝真！汇款给他，助他一臂之力！", action: () => { timeMachineFlags.jishouRemoteInvestSuccess = false; if (playerStats.wealth >= 2) { playerStats.wealth -=1; playerStats.favorability += 2; timeMachineFlags.jishouRemoteInvestSuccess = true; } }, feedbackText: () => { if (timeMachineFlags.jishouRemoteInvestSuccess) { return "你决定投资朝真的公司！这是一项明智的决定！财富-1💰, 好感度+2❤️"; } else { return "你想投资，但可惜手头的资金不足 (需要财富>=2才能进行此项投资)。"; } }, next_is_pool_or_major: true }, { text: "远程投资风险太高，还是谨慎一些。", feedbackText: "你决定不进行远程投资，觉得风险难以把控。", next_is_pool_or_major: true }] }
    };
    const timeMachineStory = {
        'start': { text: "亲爱的珊珊，欢迎来到‘人生选择体验馆’！我是你的专属时光向导朝真。在这里，每一个选择都可能开启一段不同的人生旅程。\n\n当前状态：\n与朝真的好感度：❤️❤️❤️\n当前财富值：💰 (少量)\n当前名望值：✨ (少量)\n\n准备好了吗？让我们一起探索那些未知的平行宇宙吧！", onLoad: () => { playerStats = { favorability: 3, wealth: 1, reputation: 1, jishouWorkType: null, initialFavorabilityBeforeJishou: 3 }; dailyInteractionCounter = 0; timeMachineFlags = { metBeggarAndHelped: false, investedInChaozhen: false, jishouRemoteInvestSuccess: false }; updateAttributeDisplay(); }, options: [{ text: "我准备好了，朝真！", next: 'daily_interaction_pool_1' }] },
        'daily_interaction_pool_1': { type: 'daily_pool', events: ['ask_buy_milk_tea', 'ask_share_daily', 'ask_see_movie'], interactions_to_show: 2, next_major_event: 'graduation_choice' },
        'ask_buy_milk_tea': dailyEventsTemplates.ask_buy_milk_tea,
        'ask_share_daily': dailyEventsTemplates.ask_share_daily,
        'ask_see_movie': dailyEventsTemplates.ask_see_movie,
        'graduation_choice': { text: "2025年7月，我顺利拿到了湘西职院的毕业证书。站在人生的岔路口，微风拂过我的脸颊，带来了未来的气息。我决定……", onLoad: () => { playerStats.initialFavorabilityBeforeJishou = playerStats.favorability; }, options: [{ text: "留在吉首，寻求安稳。", favorability_change: -2, next: 'jishou_start' }, { text: "接受朝真的邀请，一起去长沙闯荡一番！", favorability_change: 1, next: 'changsha_start' }, { text: "相信命运的彩票，搏一个暴富的未来！", next: 'lottery_start' }] },
        'jishou_start': { text: "我辞去了朝真舅妈家的工作，想在吉首找一份更稳定的幼师工作。这时，有两个机会摆在我面前……", options: [{ text: "进入一家看起来不错的私立幼儿园，薪资尚可。", action: () => { playerStats.jishouWorkType = 'private'; }, wealth_change: 1, feedbackText: "进入私立幼儿园，薪资高一些。财富+1💰", next: 'jishou_daily_interaction_after_work_choice' }, { text: "去了一家公立幼儿园，更稳定但收入较低。", action: () => { playerStats.jishouWorkType = 'public'; }, reputation_change: 1, feedbackText: "公立幼儿园工作稳定，受人尊敬。声望+1✨", next: 'jishou_daily_interaction_after_work_choice' }] },
        'jishou_daily_interaction_after_work_choice': { type: 'daily_pool', events: ['jishou_daily_call_parents', 'jishou_daily_read_book', 'jishou_daily_chaozhen_thought', 'jishou_private_career_boost', 'jishou_new_year_chaozhen_visit', 'jishou_learn_finance_invest_market', 'jishou_invest_chaozhen_remotely'], interactions_to_show: 3, next_major_event: 'jishou_emotional_choice_intro' },
        'jishou_daily_call_parents': dailyEventsTemplates.jishou_daily_call_parents,
        'jishou_daily_read_book': dailyEventsTemplates.jishou_daily_read_book,
        'jishou_daily_chaozhen_thought': dailyEventsTemplates.jishou_daily_chaozhen_thought,
        'jishou_private_career_boost': dailyEventsTemplates.jishou_private_career_boost,
        'jishou_new_year_chaozhen_visit': dailyEventsTemplates.jishou_new_year_chaozhen_visit,
        'jishou_learn_finance_invest_market': dailyEventsTemplates.jishou_learn_finance_invest_market,
        'jishou_invest_chaozhen_remotely': dailyEventsTemplates.jishou_invest_chaozhen_remotely,
        'jishou_emotional_choice_intro': { text: "在吉首的日子平淡如水，转眼间，我也到了人们常说的谈婚论嫁的年纪。通过一些相亲，我遇到了两个人……", options: [{ text: "选择李建军（那个婚前温柔体贴的男人）。", next: 'jishou_married_li_jianjun_check' }, { text: "我决定再等等，不想轻易进入婚姻，继续专注工作和生活。", next: 'jishou_waited_for_love_path_check' }] },
        'jishou_married_li_jianjun_check': { onLoad: () => { if (playerStats.favorability < 2 || playerStats.initialFavorabilityBeforeJishou < 2 ) { advanceToNode('ending_jishou_li_jianjun_both_miserable'); } else { advanceToNode('ending_jishou_li_jianjun_she_miserable_he_ok'); } } },
        'ending_jishou_li_jianjun_both_miserable': { type: 'ending', title: "结局：尘缘错付两皆伤", description: "我嫁给了李建军，以为找到了依靠。婚后，我像母亲一样生了几个孩子才生到男孩。但他的真面目逐渐暴露，酗酒、家暴……日子苦不堪言。后来，生育率持续走低，幼儿园大量倒闭，我失业了，只能去广东打工。2055年，50岁的我来到长沙，在一家小超市找到了收银的工作。超市的老板娘很和善，只是她的丈夫，那个沉默寡言、腿脚有些不便的章老板，总让我觉得有些莫名的熟悉……直到有一天，我无意中听到了他的故事：曾经意气风发的大学生，因为一段无疾而终的感情而心灰意冷，被家人嘲笑，患上抑郁，放弃了所有理想，最终娶妻生子，守着这家小超市了此残生……原来，他就是朝真。我们，都过得不好。", developer_comment: "唉，一步错，步步错。如果当初我们都勇敢一点，是不是结局就会不一样？" },
        'ending_jishou_li_jianjun_she_miserable_he_ok': { type: 'ending', title: "结局：云泥殊途再相望", description: "我嫁给了李建军，以为找到了依靠。婚后，我像母亲一样生了几个孩子才生到男孩。但他的真面目逐渐暴露，酗酒、家暴……日子苦不堪言。后来，生育率持续走低，幼儿园大量倒闭，我失业了，只能去广东打工。2055年，50岁的我来到长沙，在一家小超市找到了收银的工作。超市的老板娘很和善。后来我才知道，这家生意兴隆的连锁超市品牌的创始人，正是当年那个有些青涩的朝真。他‘封心锁爱’后，将所有精力投入事业，凭借过人的才智和时代的机遇，成为了名动一方的商界传奇。而我，只是他庞大商业帝国里一个毫不起眼的员工。那天，他西装革履地来巡店，在人群的簇拥下，我们的目光有短暂的交汇。他眼中没有了当年的炽热，只有礼貌的疏离，或许还带着一丝不易察觉的复杂情绪。他过得很好，只是，那份好，与我无关了。", developer_comment: "你终究还是选择了你认为的安稳。我曾为你心痛，但人生无法回头。我成功了，却也失去了曾经最珍视的你。祝好吧，陌生人。" },
        'jishou_waited_for_love_path_check': { onLoad: () => { if (playerStats.favorability >= 4 && playerStats.initialFavorabilityBeforeJishou >=2 && (timeMachineFlags.jishouRemoteInvestSuccess || playerStats.wealth >=4 )) { advanceToNode('ending_jishou_rekindle_with_chaozhen_successful'); } else if (playerStats.wealth > 3 && playerStats.favorability < 4) { advanceToNode('ending_jishou_career_woman_empty'); } else { advanceToNode('ending_jishou_waited_alone_or_settled'); } } },
        'ending_jishou_waited_alone_or_settled': { type: 'ending', title: "结局：静水流年待凡尘", description: "我选择继续等待那份‘互相喜欢、互相欣赏’的爱情。日子虽然平淡，但也自由。只是，看着身边的人都成家立业，偶尔也会感到孤独。我谈过几次不咸不淡的恋爱，却总是重蹈覆辙，无法真正敞开心扉。2055年，我依然在吉首，早早嫁给了一个不好不坏的普通人，过着不好不坏的生活。", developer_comment: "或许平淡也是一种幸福，只是珊珊，你值得被更好的人爱。不知道在另一个宇宙，你是否找到了你的意中人。" },
        'ending_jishou_rekindle_with_chaozhen_successful': { type: 'ending', title: "结局：守得云开见月明", description: "我选择继续等待，专注于自我提升和工作。日子过得充实而平静。直到30岁那年，在一个普通的午后，朝真突然出现在我面前。他成熟了许多，眼神中带着一丝疲惫，但更多的是坚定和成功者的自信。他的“俏孙二娘”自动化烧烤已经遍布全国，成为了一个传奇品牌。他告诉我，他这些年一直在努力，也一直在默默关注我。他说：‘珊珊，如果你还没嫁人，我娶你。’看着他真挚的眼神，这一次，我没有再犹豫，笑着点了点头。我们的婚礼简单而温馨，幸福虽迟，但终究还是来了。", developer_comment: "傻丫头，我就知道你会等我！这些年的努力，都是为了能堂堂正正地站在你面前！以后，有我！" },
        'ending_jishou_career_woman_empty': { type: 'ending', title: "结局：繁华阅尽心何寄", description: "我选择将全部精力投入事业。凭借在幼教领域的经验和持续学习，我抓住了几次机遇，在吉首成功创业，拥有了自己的教育机构，成为了当地小有名气的女强人。生活优渥，物质丰足，但夜深人静，面对空旷的家，心中总有难以填补的失落。我赢得了事业，却似乎弄丢了最初的悸动与陪伴。", developer_comment: "珊珊，你用双手创造了属于自己的辉煌，但成功的喜悦，是否能完全替代情感的温暖？或许，人生总有取舍。" },
        'changsha_start': { text: "毕业后，我决定相信朝真一次，和他一起去了长沙。他一边继续他的学业，一边开始捣鼓他的自动化项目。我在他舅妈家继续帮忙，也时不时为他表姐的“俏孙二娘”烧烤店出谋划策，比如设计新的宣传单，或者搞一些小活动。我们的感情在日常的点滴相处中慢慢升温。", options: [{ text: "开启在长沙的新生活，先提升一下自己吧！", favorability_change: 1, next: 'changsha_learn_finance_event' }] },
        'changsha_learn_finance_event': { text: "在长沙安顿下来后，我发现空闲时间还挺多。看到一些关于理财和金融的课程资料，感觉对未来规划会很有帮助。我要不要花时间学习一下？", options: [{ text: "学习金融知识，提升财商！", wealth_change: 1, reputation_change: 1, feedbackText: "通过学习，你对金融和投资有了初步的了解，感觉眼界开阔了不少。财富潜力+1💰 声望+1✨", next: 'changsha_invest_chaozhen_opportunity' }, { text: "算了，这些太复杂了，还是享受生活吧。", feedbackText: "你选择把时间花在更轻松的事情上。", next: 'changsha_invest_chaozhen_opportunity' }] },
        'changsha_invest_chaozhen_opportunity': { text: () => `朝真的自动化烧烤项目进展顺利，但他最近似乎在为扩大规模的资金发愁。凭借我学到的金融知识，我判断这项目很有潜力 (当前财富: ${'💰'.repeat(Math.max(0, playerStats.wealth))})。要不要投资支持他呢？`, options: [{ text: "朝真，我相信你！这点钱你先拿着，算我投资你的梦想！", action: () => { if (playerStats.wealth >= 2) { playerStats.wealth -= 1; playerStats.favorability += 2; timeMachineFlags.investedInChaozhen = true; } }, feedbackText: () => timeMachineFlags.investedInChaozhen ? `你将部分积蓄投资给朝真，他非常感动！你们的感情更近了一步。财富-1💰 好感度+2❤️ (投资成功！)` : `你想投资，但可惜手头的资金不足 (需要财富>=2)。`, next: 'changsha_travel_opportunity_ask' }, { text: "（还是再观望一下吧，创业风险太大了。）", action: () => { timeMachineFlags.investedInChaozhen = false; }, feedbackText: "你决定暂时不投资，朝真虽然有些失落，但也表示理解。", next: 'changsha_travel_opportunity_ask' }] },
        'changsha_travel_opportunity_ask': { text: "在长沙的日子渐渐稳定，朝真看着忙碌的我，提议道：“珊珊，最近我们都挺辛苦的。不如抽空一起去内蒙古看看大草原吧？放松一下心情，还能品尝当地的特色美食，怎么样？”", options: [{ text: "“太棒了！去内蒙古！去看看不一样的风景！”", next: 'inner_mongolia_arrival' }, { text: "（摇摇头）“还是算了吧，目前还是想把精力更多放在长沙这边的事业上。”", next: 'changsha_chaozhen_graduates' }] },
        'inner_mongolia_arrival': { text: "我们踏上了前往内蒙古的旅程。广阔无垠的草原在我们眼前展开，蓝天白云仿佛触手可及，成群的牛羊悠闲地散落在草原上。在游览一个热闹的当地集市时，我们注意到路边坐着一位衣衫褴褛的老人，他伸出干枯的手，眼神中充满了无助与渴望。", options: [{ text: "（心中不忍，从口袋里拿出一些钱，悄悄递给老人。）“老人家，这点钱不多，您拿着买点吃的吧。”", action: () => { timeMachineFlags.metBeggarAndHelped = true; playerStats.reputation += 1; }, feedbackText: "你悄悄地帮助了老人，内心感到一丝温暖。 声望+1✨", next: 'inner_mongolia_food_choice' }, { text: "（犹豫了一下，想到自己和朝真也并不宽裕，便默默地走开了。）", action: () => { timeMachineFlags.metBeggarAndHelped = false; }, next: 'inner_mongolia_food_choice' }] },
        'inner_mongolia_food_choice': { text: "结束了一天的游玩，夕阳为草原镀上了一层金边，我们也感到饥肠轆轆。当地人热情地向我们推荐了他们的特色美食。我们决定吃些什么呢？\\n\\n（朝真小声说：“刚才你真善良，珊珊。你的选择总是让我感到温暖。”——这或许会是命运的一个小小转折点。）", options: [{ text: "选项G1：“还是吃点米饭和几样家常菜吧，经济实惠，也更习惯一些。”", next: 'inner_mongolia_ate_rice' }, { text: "选项G2：“来都来了，当然要尝尝当地闻名的烤全羊或者手扒肉！好好体验一下游牧风情！”", next: 'inner_mongolia_ate_lamb_check' }] },
        'inner_mongolia_ate_rice': { text: "虽然是简单的家常菜，但在奔波一天后，热腾腾的饭菜也让我们感到格外满足。内蒙古的风景确实壮美，这次旅行给我们留下了愉快的回忆。回到长沙后，我们又投入到了各自的忙碌与奋斗中。", options: [{ text: "继续在长沙的生活与奋斗...", next: 'changsha_chaozhen_graduates' }] },
        'inner_mongolia_ate_lamb_check': { onLoad: () => { if (timeMachineFlags.metBeggarAndHelped) { advanceToNode('world_war_3_trigger_dialogue'); } else { advanceToNode('inner_mongolia_ate_lamb_no_revolution'); } } },
        'inner_mongolia_ate_lamb_no_revolution': { text: "烤羊肉果然名不虚传，外酥里嫩，香气扑鼻！我们吃得不亦乐乎，大快朵颐。这次内蒙古之行真是太棒了，留下了许多美好的瞬间和味蕾的记忆。心满意足地返回长沙后，生活依旧继续。", options: [{ text: "带着美好的回忆，回到长沙...", next: 'changsha_chaozhen_graduates' }] },
        'world_war_3_trigger_dialogue': { text: "在品尝风味十足的羊肉时，我们和几位热情的当地牧民攀谈起来。从他们的歌谣与故事中，我们不仅感受到了草原的辽阔与自由，也隐约捕捉到了一些关于远方世界的动荡、社会深层矛盾以及某些传播中的革命思想的低语。这些话语如同投入湖面的石子，在我们心中泛起了层层涟漪。\\n\\n回到长沙后没过几个月，国际局势果然风云突变，第三次世界大战的阴云迅速笼罩全球，战争的号角在世界的各个角落凄厉地吹响了！", options: [{ text: "面对这样的世界，我们不能袖手旁观！", next: 'revolution_path_start' }] },
        'revolution_path_start': { text: "世界大战的烽火意外地点燃了我们内心深处潜藏的理想与激情。朝真，凭借他那颗充满智慧的头脑和对正义的执着追求，毅然决然地投身于风起云涌的左翼无产阶级革命事业。他立志要推翻旧世界的种种压迫与不公，建立一个真正属于人民的、公平和谐的新社会。他所掌握的自动化和计算机技术，在情报的秘密传递、后勤物资的高效调度，乃至新型防御武器的初步构想上，都发挥了旁人难以估量的关键作用。\\n\\n而我，张珊珊，也不甘心在时代的洪流中仅仅作为一名旁观者。凭借着在“俏孙二娘”烧烤店和长沙日常生活中磨砺出的出色组织协调能力、那份骨子里的坚韧不拔，以及女性特有的敏锐直觉和同理心，我从最初负责后勤保障、组织群众宣传，一步步走向了更广阔的战场，甚至开始参与一些区域行动的策划与指挥。在烽火硝烟之中，我仿佛一朵于逆境中绽放的铿锵玫瑰。\\n\\n我们并肩作战，一同经历了无数次生与死的严峻考验。彼此的感情，在共同的信仰、共同的战斗以及无数个相互扶持的日日夜夜中，得到了前所未有的升华与锤炼。", onLoad: () => { playerStats.favorability += 3; playerStats.reputation += 5; playerStats.wealth = 1; updateAttributeDisplay(); }, options: [{ text: "为了一个崭新的世界，为了我们共同的信仰，前进！", next: 'ending_revolution_female_general' }] },
        'ending_revolution_female_general': { type: 'ending', title: "结局：烽火红颜铸国魂", description: "经过数年艰苦卓绝的浴血奋战，革命的火焰终于燃遍了五湖四海，战争以人民力量的最终胜利而宣告结束。在万众的欢呼与期待中，一个崭新的国度——中华苏维埃社会主义共和国，如同一轮朝日，在世界的东方冉冉升起，宣告成立。\\n\\n我，张珊珊，因在漫长的战争岁月中展现出的卓越领导才能、无畏的牺牲精神以及建立的不朽功勋，被共和国授予了人民女将军的光荣军衔，我的事迹成为了无数青年男女学习和敬仰的榜样。朝真，凭借其在共和国科技体系建设中的开创性贡献和高瞻远瞩的规划，被尊为新共和国科学技术发展的总设计师与核心奠基人之一。\\n\\n时光飞逝，转眼已是2055年，共和国迎来了成立三十周年的盛大庆典。我与朝真身着戎装与象征荣誉的勋章，并肩站在宏伟的中央观礼台上，俯瞰着广场上那片由朝气蓬勃的人民组成的、欢腾喜悦的海洋，心中充满了难以言喻的自豪与满足。岁月似乎并未在他眼角刻下太多痕迹，他依然是那个会在夜深人静、万籁俱寂之时，为我悄悄写下满怀爱意的动人诗句的‘癫公’，偶尔还会因为我忙于军务而略显孩子气地‘吃醋’，抱怨我陪伴他的时间太少。而我，在他心中，永远是那个最英姿飒爽、无人能及的女将军。我们的爱情，在革命的烽火中淬炼，比最纯粹的金子还要坚硬，比最璀璨的星辰还要耀眼，它将被永远镌刻在共和国的史册之中。", developer_comment: "好同志，好战友，新时代妇好，我们的爱情将会载入史册。" },
        'changsha_chaozhen_graduates': { text: "朝真毕业了，他拿着一份厚厚的商业计划书，眼睛亮晶晶地看着我，那是他的自动化烧烤店方案。他对我说……", options: [{ text: "“珊珊，我们一起把‘俏孙二娘’做大做强，卖向全世界！”", next: 'changsha_bbq_success_path' }, { text: "“珊珊，轰轰烈烈太累了，我们一起开个温馨的小超市，过平淡幸福的日子吧。”", next: 'changsha_supermarket_path' }] },
        'changsha_bbq_success_path': { text: "我们选择了充满挑战的道路。朝真负责技术研发和产品升级，我则发挥我的沟通和管理能力，负责市场推广和店铺运营。过程很辛苦，有过争吵，有过泪水，但更多的是携手并进的甜蜜。", options: [{ text: "几年后，我们的烧烤店越做越大...", wealth_change: 3, reputation_change: 2, favorability_change: 2, next: 'ending_changsha_bbq_success' }] },
        'ending_changsha_bbq_success': { type: 'ending', title: "结局：烧烤帝国的女王", description: "我们一起努力，朝真的自动化技术让“俏孙二娘”成为了享誉世界的品牌。我们25岁结婚，他给了我一个浪漫的求婚和20万彩礼。生活富足，我经常可以飞去世界各地考察市场，闲暇时我会去帮助那些留守儿童，成立了一个小小的基金会。2055年，我们儿孙满堂，看着遍布全球的“俏孙二娘”分店LOGO，在自家别墅的后花园里，相视而笑，岁月静好。", developer_comment: "我的女王大人，这一切都是我们共同打下的江山！有你，才有这一切！爱你一万年！" },
        'changsha_supermarket_path': { text: "我们决定开一家小超市，选址在一个安静的社区。朝真发挥他的技术宅特长，把小超市管理得井井有条，我还设计了一些温馨的促销活动。日子过得平淡却很温馨。", options: [{ text: "很快，我们就结婚了...", wealth_change: 1, reputation_change: 1, favorability_change: 2, next: 'ending_changsha_supermarket_happy' }] },
        'ending_changsha_supermarket_happy': { type: 'ending', title: "结局：巷口的幸福超市", description: "我们在长沙开的小超市，成为了社区里不可或缺的一部分。我们25岁结婚，不久后有了一个可爱的女儿。每年我们都会关店一段时间，全家一起出去旅游，去看看这个世界。我依然会抽时间去做公益，帮助那些可爱的孩子们。2055年，我们白发苍苍，依然在巷口的超市里，为邻里们提供便利，看着日出日落，享受着这份宁静而绵长的幸福。", developer_comment: "珊珊，最幸福的事，就是和你一起，把日子过成诗。这家小超市，就是我们爱的证明。" },
        'lottery_start': { text: "毕业后不久，我抱着试试看的心态买了一张彩票，几天后对奖，我简直不敢相信自己的眼睛——我中了一个亿！我第一时间告诉了朝真，他比我还激动，上蹿下跳，嚷嚷着要我“包养”他。看着他那副“小财迷”的样子，我忍不住笑了。", onLoad: () => { playerStats.wealth = 10; updateAttributeDisplay(); }, options: [{ text: "手握巨款，我心潮澎湃，决定...", next: 'lottery_decision_1' }] },
        'lottery_decision_1': { text: "手握巨款，我该如何规划这笔从天而降的财富，以及……如何对待这个嚷着要被“包养”的家伙呢？", options: [{ text: "开公司，实现自己的价值！至于朝真嘛……哼哼，就让他“如愿以偿”地被我“包养”起来，安心搞科研，或者……嗯，先让他健健身！", favorability_change: 3, next: 'ending_lottery_rich_lady_chaozhen' }, { text: "低调生活，一部分钱存起来，一部分用来和朝真一起规划未来，比如支持他的自动化烧烤理想，或者一起做点别的喜欢的事。", favorability_change: 2, next: 'ending_lottery_joint_venture' }] },
        'ending_lottery_rich_lady_chaozhen': { type: 'ending', title: "结局：霸道女总裁和她的“小娇夫”", description: "我成立了自己的公司，凭借着钞能力和一点点商业头脑，当上了霸道女总裁。看着朝真那因为幸福而日渐圆润的身材，我“贴心”地给他请了八个身材健硕的男模当私人教练！美其名曰“激励他健身减肥”，实际上是想看看他吃醋又不得不努力的样子。朝真果然“不负所望”，一边哀嚎着“富婆饶命”，一边在男模的“夹击”下努力健身，最终练出了让我满意的腹肌。我们的生活充满了这种啼笑皆非的“情趣”。2055年，我们依然是那对爱折腾的“癫公癫婆”，只是身边可能多了几个同样“癫”的小崽子，天天看我们秀恩爱。", developer_comment: "呜呜呜，虽然被“包养”了，但是当总裁的小娇夫也好累啊！老婆大人，腹肌给你看，今晚可以不加练了吗？爱你哟！" },
        'ending_lottery_joint_venture': { type: 'ending', title: "结局：神仙眷侣共创未来", description: "我们用这笔钱作为启动资金，朝真全身心投入到他的自动化烧烤项目中，我则负责公司的运营和投资。凭借他的才华和我的支持，我们的事业迅速崛起，成为了行业内的翘楚。我们成为了令人羡慕的“神仙伴侣”，既有财富自由，又有深厚感情，还一起成立了慈善基金，帮助更多有梦想的年轻人。2055年，我们携手站在自己商业帝国的顶峰，也一起走遍了世界的每一个角落，见证了无数美好。", developer_comment: "珊珊，谢谢你相信我，支持我。有你，我才能安心追逐梦想。我们的未来，比星空更璀璨！" }
    };

    function startNewTimeMachineGame() {
        if (endingDisplayArea) endingDisplayArea.style.display = 'none';
        if (optionsArea) optionsArea.style.display = 'flex';
        if (storyParagraph) storyParagraph.style.display = 'block';
        if (attributeFeedbackArea) attributeFeedbackArea.textContent = '';

        Object.values(timeMachineStory).forEach(node => {
            if (node.type === 'daily_interaction' || (node.events && node.type === 'daily_pool')) {
                if (node.events) {
                    node.events.forEach(eventId => {
                        const eventNode = timeMachineStory[eventId] || dailyEventsTemplates[eventId];
                        if (eventNode && typeof eventNode._playedThisRound !== 'undefined') eventNode._playedThisRound = false;
                    });
                } else if (typeof node._playedThisRound !== 'undefined') {
                    node._playedThisRound = false;
                }
            }
        });
        Object.values(dailyEventsTemplates).forEach(event => {
            if (typeof event._playedThisRound !== 'undefined') event._playedThisRound = false;
        });

        playerStats = { favorability: 3, wealth: 1, reputation: 1, jishouWorkType: null, initialFavorabilityBeforeJishou: 3 };
        dailyInteractionCounter = 0;
        timeMachineFlags = { metBeggarAndHelped: false, investedInChaozhen: false, jishouRemoteInvestSuccess: false };
        updateAttributeDisplay();
        advanceToNode('start');
    }

    function updateAttributeDisplay() { if (!favorabilityDisplay || !wealthDisplay || !reputationDisplay) return; let favorabilityHearts = ''; if (playerStats.favorability <= 0) { favorabilityHearts = '💔'; } else if (playerStats.favorability > 5) { favorabilityHearts = '❤️❤️❤️❤️❤️<span style="font-size:0.8em; vertical-align:super;">+</span>'; } else { favorabilityHearts = '❤️'.repeat(Math.max(0, playerStats.favorability)); if (playerStats.favorability <= 0 && favorabilityHearts === '') favorabilityHearts = '💔'; } favorabilityDisplay.innerHTML = favorabilityHearts; let wealthIcons = ''; if (playerStats.wealth <= 0) { wealthIcons = '💸'; } else if (playerStats.wealth >= 7) { wealthIcons = '💰💰💰💰<span style="font-size:0.8em; vertical-align:super;">+</span>'; } else if (playerStats.wealth >= 4) { wealthIcons = '💰💰💰<span style="font-size:0.8em; vertical-align:super;">+</span>'; } else if (playerStats.wealth >=3 ) { wealthIcons = '💰💰💰';} else { wealthIcons = '💰'.repeat(Math.max(0, playerStats.wealth)); if (playerStats.wealth <= 0 && wealthIcons === '') wealthIcons = '💸'; } wealthDisplay.innerHTML = wealthIcons; let reputationIcons = ''; if (playerStats.reputation <= 0) { reputationIcons = '😶'; } else if (playerStats.reputation >= 7) { reputationIcons = '✨✨✨✨<span style="font-size:0.8em; vertical-align:super;">+</span>'; } else if (playerStats.reputation >= 4) { reputationIcons = '✨✨✨<span style="font-size:0.8em; vertical-align:super;">+</span>'; } else if (playerStats.reputation >=3) { reputationIcons = '✨✨✨'; } else { reputationIcons = '✨'.repeat(Math.max(0, playerStats.reputation)); if (playerStats.reputation <= 0 && reputationIcons === '') reputationIcons = '😶'; } reputationDisplay.innerHTML = reputationIcons; }
function typeWriterEffect(text, element, callback) {
    if (!element) {
        console.error("typeWriterEffect: 元素为 null，文本内容：", text);
        if (callback) callback();
        return;
    }

    // 如果此元素上已存在活动的打字机，则取消它
    if (activeTypewriters.has(element)) {
        clearTimeout(activeTypewriters.get(element));
        activeTypewriters.delete(element);
    }

    let i = 0;
    element.innerHTML = ""; // 清空元素内容
    if (typeof text !== 'string') {
        text = String(text);
    }
    const processedText = text.replace(/\\n/g, '\n');

    function type() {
        if (i < processedText.length) {
            element.innerHTML += processedText.charAt(i);
            i++;
            let timeoutId = setTimeout(type, 25); // 延时调用自身以打印下一个字符
            activeTypewriters.set(element, timeoutId); // 存储当前计时器ID
        } else {
            activeTypewriters.delete(element); // 完成后从活动映射中移除
            if (callback) callback(); // 完成后调用回调函数
        }
    }
    type();
}
  function advanceToNode(nodeId) {
    // `nodeId` 是此特定调用旨在处理的ID。
    // `currentNodeId` 是全局状态，可能会被 `onLoad` 更改。

    let localNodeIdToProcess = nodeId; // 使用局部变量记录此实例正在处理的节点ID
    currentNodeId = nodeId;           // 更新全局当前节点ID

    let nodeToProcess = timeMachineStory[localNodeIdToProcess];

    if (!nodeToProcess) {
        console.error("错误：未找到节点：", localNodeIdToProcess);
        if (storyParagraph) storyParagraph.textContent = `错误：找不到节点 ${localNodeIdToProcess}`;
        if (optionsArea) optionsArea.innerHTML = '';
        return;
    }

    if (attributeFeedbackArea) attributeFeedbackArea.textContent = '';

    // 如果此节点是结局类型，则显示它并终止。
    if (nodeToProcess.type === 'ending') {
        displayEnding(nodeToProcess);
        return;
    }

    // 如果存在，则执行 onLoad。
    if (nodeToProcess.onLoad) {
        nodeToProcess.onLoad(); // 这可能会递归调用 advanceToNode 并更改全局 `currentNodeId`

        // onLoad之后，如果全局`currentNodeId`与此advanceToNode实例最初调用的`localNodeIdToProcess`不同，
        // 则表示`onLoad`触发了到新节点的导航。
        // 新的`advanceToNode`调用（递归的）将处理该新节点。
        // 因此，此当前实例应终止。
        if (currentNodeId !== localNodeIdToProcess) {
            return; // 关键：如果 onLoad 导航到其他地方，则停止此实例。
        }

        // 如果 `currentNodeId` 仍为 `localNodeIdToProcess`，则表示 `onLoad`：
        // 1. 未调用 `advanceToNode`。
        // 2. 调用了 `advanceToNode` 但它最终返回了控制权，而没有永久更改为*不同*的节点ID。
        // 3. 修改了当前节点 `localNodeIdToProcess` 的属性。
        // 我们应该重新获取 `nodeToProcess`，以防其属性（如 `.type`）被 `onLoad` 更改。
        nodeToProcess = timeMachineStory[localNodeIdToProcess];
        if (!nodeToProcess) {
            console.error("错误：节点在 onLoad 后对于 nodeId 失效：", localNodeIdToProcess);
            return;
        }
        // 如果在 `onLoad` 之后，当前节点（`localNodeIdToProcess`）现在实际上已成为结局
        // （例如，其类型已更改，或某些条件现在使其成为结局），则显示它。
        if (nodeToProcess.type === 'ending') {
            displayEnding(nodeToProcess);
            return;
        }
    }

    // 如果是每日事件池，则处理它。
    if (nodeToProcess.type === 'daily_pool') {
        handleDailyPool(nodeToProcess);
        return;
    }

    // 具有文本和选项的常规节点
    let displayText = typeof nodeToProcess.text === 'function' ? nodeToProcess.text() : nodeToProcess.text;
    if (typeof displayText === 'undefined') {
        console.error("错误：节点文本未定义：", localNodeIdToProcess);
        if (storyParagraph) storyParagraph.textContent = `错误：节点 ${localNodeIdToProcess} 文本未定义。`;
        if (optionsArea) optionsArea.innerHTML = '';
        return;
    }

    if (storyParagraph) {
        typeWriterEffect(displayText, storyParagraph, () => {
            if (optionsArea) optionsArea.innerHTML = '';
            // 此处使用 storyTimeMachine[currentNodeId] 是因为 typeWriterEffect 是异步的。
            // 当回调运行时，如果发生了其他操作，全局 currentNodeId 可能是相关的。
            // 但对于选项生成，它应严格针对刚显示其文本的节点。
            const nodeForOptions = timeMachineStory[currentNodeId];
            if (nodeForOptions && nodeForOptions.options) {
                nodeForOptions.options.forEach((option, index) => {
                    const button = document.createElement('button');
                    let optionText = typeof option.text === 'function' ? option.text() : option.text;
                    button.innerHTML = optionText; // 使用 innerHTML 以允许富文本（如果将来需要）
                    button.addEventListener('click', () => selectOption(index));
                    if (optionsArea) optionsArea.appendChild(button);
                });
            }
        });
    }
    updateAttributeDisplay();
}

    function handleDailyPool(poolNode) { if (!poolNode || !Array.isArray(poolNode.events) || poolNode.events.length === 0) { if (poolNode && poolNode.next_major_event) { proceedToNextMajorEvent(poolNode); } else { advanceToNode('start'); } return; } if (dailyInteractionCounter < poolNode.interactions_to_show) { const availableEvents = poolNode.events.filter(eventId => { const eventNode = timeMachineStory[eventId] || dailyEventsTemplates[eventId]; return eventNode && !eventNode._playedThisRound; }); if (availableEvents.length > 0) { const eventId = availableEvents[Math.floor(Math.random() * availableEvents.length)]; const eventToPlay = timeMachineStory[eventId] || dailyEventsTemplates[eventId]; if (eventToPlay) { eventToPlay._playedThisRound = true; dailyInteractionCounter++; advanceToNode(eventId); } else { proceedToNextMajorEvent(poolNode); } } else { proceedToNextMajorEvent(poolNode); } } else { proceedToNextMajorEvent(poolNode); } }
    function proceedToNextMajorEvent(poolNode) { if (poolNode && Array.isArray(poolNode.events)) { poolNode.events.forEach(eventId => { const eventNode = timeMachineStory[eventId] || dailyEventsTemplates[eventId]; if (eventNode && typeof eventNode._playedThisRound !== 'undefined') { eventNode._playedThisRound = false; } }); } dailyInteractionCounter = 0; if (poolNode && poolNode.next_major_event) { advanceToNode(poolNode.next_major_event); } else { advanceToNode('start'); } }

    function selectOption(optionIndex) {
        const node = timeMachineStory[currentNodeId];
        if (!node || !node.options || !node.options[optionIndex]) { console.error("Error selecting option:", currentNodeId, optionIndex); return; }
        const selectedOption = node.options[optionIndex];
        let currentFeedback = "";

        if (selectedOption.action) selectedOption.action();

        if (typeof selectedOption.feedbackText === 'function') { currentFeedback = selectedOption.feedbackText(); }
        else if (selectedOption.feedbackText) { currentFeedback = selectedOption.feedbackText; }

        let attributeChangesFeedback = "";
        if (typeof selectedOption.favorability_change === 'number') { playerStats.favorability += selectedOption.favorability_change; attributeChangesFeedback += ` 好感度 ${selectedOption.favorability_change > 0 ? '+' : ''}${selectedOption.favorability_change}❤️`; }
        if (typeof selectedOption.wealth_change === 'number') { playerStats.wealth += selectedOption.wealth_change; attributeChangesFeedback += ` 财富 ${selectedOption.wealth_change > 0 ? '+' : ''}${selectedOption.wealth_change}💰`; }
        if (typeof selectedOption.reputation_change === 'number') { playerStats.reputation += selectedOption.reputation_change; attributeChangesFeedback += ` 声望 ${selectedOption.reputation_change > 0 ? '+' : ''}${selectedOption.reputation_change}✨`; }

        if (attributeChangesFeedback) { currentFeedback = (currentFeedback ? currentFeedback + " " : "") + attributeChangesFeedback.trim(); }
        if (attributeFeedbackArea) attributeFeedbackArea.textContent = currentFeedback.trim() || '';
        updateAttributeDisplay();

        if (node.type === 'daily_interaction' && selectedOption.next_is_pool_or_major) {
            let sourcePoolId = null;
            for (const key in timeMachineStory) { if (timeMachineStory[key].type === 'daily_pool' && timeMachineStory[key].events && timeMachineStory[key].events.includes(currentNodeId)) { sourcePoolId = key; break; } }
            if (sourcePoolId && timeMachineStory[sourcePoolId]) { handleDailyPool(timeMachineStory[sourcePoolId]); }
            else { if (selectedOption.next) { advanceToNode(selectedOption.next); } else { advanceToNode('start'); } }
        } else if (selectedOption.next) { advanceToNode(selectedOption.next); }
        else if (node.type !== 'ending' && !(node.onLoad && Object.keys(node).filter(k => k !== 'onLoad').length === 0)) {
            // console.warn("Warning: Option may lead to a node with no 'next' and is not an ending or a pure onLoad dispatcher:", currentNodeId, optionIndex);
        }
    }

    function displayEnding(endingNode) { if (!storyParagraph || !optionsArea || !endingDisplayArea || !endingTitleEl || !endingDescriptionEl || !developerCommentEl) return; storyParagraph.style.display = 'none'; optionsArea.style.display = 'none'; if (attributeFeedbackArea) attributeFeedbackArea.textContent = ''; endingDisplayArea.style.display = 'block'; endingTitleEl.textContent = endingNode.title || "游戏结束"; typeWriterEffect(endingNode.description, endingDescriptionEl, () => { if (endingNode.developer_comment) { typeWriterEffect("朝真的人生总结：" + endingNode.developer_comment, developerCommentEl); } else { if(developerCommentEl) developerCommentEl.textContent = ""; } }); }
    if (restartTimeMachineBtn) restartTimeMachineBtn.addEventListener('click', startNewTimeMachineGame);

    // --- Loading Simulation ---
    let progress = 0; const loadingDuration = 1500; const progressIncrement = 100 / (loadingDuration / 100); function simulateLoading() { const interval = setInterval(() => { progress += progressIncrement; if (progress >= 100) { progress = 100; if (progressBar) progressBar.style.width = `${progress}%`; clearInterval(interval); if (loadingTextEl) loadingTextEl.textContent = "回忆加载完毕！"; if (startGameBtn) startGameBtn.style.display = 'block'; } else { if (progressBar) progressBar.style.width = `${progress}%`; } }, 100); }
    simulateLoading(); // Start loading simulation

    // --- Window Resize Listener ---
    window.addEventListener('resize', () => {
        if (mainScreen && mainScreen.style.display === 'flex' &&
            particleHeartInteractionArea && particleHeartInteractionArea.style.display === 'flex' &&
            !heartIsExploding) {
            // Check if canvas and its parent are valid and have dimensions
            if (canvas && particleHeartInteractionArea.clientWidth > 0 && particleHeartInteractionArea.clientHeight > 0) {
                initCanvasHeart();
            }
        }
    });
});