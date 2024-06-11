javascript:(function(){
    let startTime = 0;
    let endTime = 0;
    let looping = false;
    let loopCount = 30;
    let currentLoop = 0;
    let isPaused = false;
    let isHidden = false;
    let fontSize = 14;
    let currentTab = 'info'; // Default tab

    const video = document.querySelector('video');

    // Create HTML elements for the control panel and tabs
    const controlPanel = document.createElement('div');
    controlPanel.style.position = 'fixed';
    controlPanel.style.top = '10px';
    controlPanel.style.left = '10px';
    controlPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    controlPanel.style.color = 'white';
    controlPanel.style.padding = '10px';
    controlPanel.style.borderRadius = '5px';
    controlPanel.style.zIndex = '1000';
    controlPanel.style.resize = 'both';
    controlPanel.style.overflow = 'auto';
    controlPanel.style.fontSize = `${fontSize}px`;
    controlPanel.style.cursor = 'move';
    document.body.appendChild(controlPanel);

    const tabContainer = document.createElement('div');
    tabContainer.style.display = 'flex';
    tabContainer.style.justifyContent = 'space-around';
    tabContainer.style.marginBottom = '10px';

    const infoTab = document.createElement('div');
    infoTab.innerText = 'Hữu Tiền';
    infoTab.style.cursor = 'pointer';
    infoTab.style.padding = '5px 10px';
    infoTab.style.backgroundColor = 'gray';
    infoTab.style.borderRadius = '3px';
    infoTab.addEventListener('click', () => switchTab('info'));

    const kaiwaTab = document.createElement('div');
    kaiwaTab.innerText = 'Kaiwa Shadowing';
    kaiwaTab.style.cursor = 'pointer';
    kaiwaTab.style.padding = '5px 10px';
    kaiwaTab.style.backgroundColor = 'gray';
    kaiwaTab.style.borderRadius = '3px';
    kaiwaTab.addEventListener('click', () => switchTab('kaiwa'));

    const practiceTab = document.createElement('div');
    practiceTab.innerText = 'aanime.biz, Tiktok, Youtube...';
    practiceTab.style.cursor = 'pointer';
    practiceTab.style.padding = '5px 10px';
    practiceTab.style.backgroundColor = 'gray';
    practiceTab.style.borderRadius = '3px';
    practiceTab.addEventListener('click', () => switchTab('practice'));

    tabContainer.appendChild(infoTab);
    tabContainer.appendChild(kaiwaTab);
    tabContainer.appendChild(practiceTab);
    controlPanel.appendChild(tabContainer);

    const contentDiv = document.createElement('div');
    controlPanel.appendChild(contentDiv);

    let isDragging = false;
    let dragStartX, dragStartY, initialLeft, initialTop;

    controlPanel.addEventListener('mousedown', function(e) {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initialLeft = parseInt(controlPanel.style.left, 10);
        initialTop = parseInt(controlPanel.style.top, 10);
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            let deltaX = e.clientX - dragStartX;
            let deltaY = e.clientY - dragStartY;
            controlPanel.style.left = `${initialLeft + deltaX}px`;
            controlPanel.style.top = `${initialTop + deltaY}px`;
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    function updateInfo() {
        if (currentTab !== 'info') return;
        contentDiv.innerHTML = `
            <p>Tốc độ phát: ${video.playbackRate.toFixed(2)}</p>
            <p>Thời gian bắt đầu: ${startTime.toFixed(2)}s</p>
            <p>Thời gian kết thúc: ${endTime.toFixed(2)}s</p>
            <p>Lặp lại lần: ${currentLoop} / ${loopCount}</p>
            <p>Âm lượng: ${(video.volume * 100).toFixed(0)}%</p>
            <p>Phím hướng dẫn:</p>
            <p>1, 2, 3, 4, 5, 6: Điều chỉnh tốc độ phát</p>
            <p>a, s: Điều chỉnh điểm bắt đầu (-1s, +1s)</p>
            <p>d, f: Điều chỉnh điểm kết thúc (-1s, +1s)</p>
            <p>z, x: Điều chỉnh điểm bắt đầu (-0.1s, +0.1s)</p>
            <p>c, v: Điều chỉnh điểm kết thúc (-0.1s, +0.1s)</p>
            <p>b: Đặt điểm bắt đầu tại thời điểm hiện tại</p>
            <p>n: Đặt điểm kết thúc và bắt đầu lặp lại</p>
            <p>h: Hủy quá trình lặp lại</p>
            <p>j, k: Tăng/giảm số lần lặp lại</p>
            <p>m: Ẩn/hiện bảng điều khiển</p>
            <p>+, -: Tăng/giảm kích thước font chữ</p>
            <p>t, g: Tăng/giảm âm lượng</p>
            <p>Nhấn F12 để đóng bảng điều khiển.</p>
        `;
    }

    function switchTab(tab) {
        currentTab = tab;
        infoTab.style.backgroundColor = (tab === 'info') ? 'lightgray' : 'gray';
        kaiwaTab.style.backgroundColor = (tab === 'kaiwa') ? 'lightgray' : 'gray';
        practiceTab.style.backgroundColor = (tab === 'practice') ? 'lightgray' : 'gray';
        if (tab === 'info') {
            updateInfo();
        } else if (tab === 'kaiwa') {
            contentDiv.innerHTML = `<p>Kaiwa Shadowing content goes here.</p>`;
        } else if (tab === 'practice') {
            contentDiv.innerHTML = `<p>Listening Practice content goes here.</p>`;
        }
    }

    function loopVideo() {
        if (looping && video.currentTime >= endTime && !isPaused) {
            isPaused = true;
            video.pause();
            currentLoop++;
            updateInfo();
            const segmentDuration = endTime - startTime;
            const pauseDuration = segmentDuration * 2 + 1;
            if (currentLoop < loopCount) {
                setTimeout(() => {
                    video.currentTime = startTime;
                    isPaused = false;
                    video.play();
                }, pauseDuration * 1000);
            } else {
                looping = false;
                console.log("Hoàn thành lặp lại.");
            }
        }
    }

    function restartLoop() {
        isPaused = true;
        video.pause();
        currentLoop = 0;
        updateInfo();
        setTimeout(() => {
            video.currentTime = startTime;
            isPaused = false;
            video.play();
        }, (endTime - startTime) * 1000);
    }

    video.addEventListener('timeupdate', loopVideo);

    function adjustTime(type, delta) {
        if (type === "start") {
            startTime = Math.max(0, startTime + delta);
            updateInfo();
            video.currentTime = startTime;
            video.play();
            if (looping) {
                restartLoop();
            }
        } else if (type === "end") {
            endTime = Math.max(startTime + 0.1, endTime + delta);
            updateInfo();
        }
    }

    function adjustPlaybackRate(delta) {
        video.playbackRate = Math.max(0.1, video.playbackRate * (1 + delta / 100));
        updateInfo();
    }

    function adjustVolume(delta) {
        video.volume = Math.min(1, Math.max(0, video.volume + delta));
        updateInfo();
    }

    function toggleInfoDiv() {
        isHidden = !isHidden;
        controlPanel.style.display = isHidden ? 'none' : 'block';
    }

    function adjustFontSize(delta) {
        fontSize = Math.max(10, fontSize + delta);
        controlPanel.style.fontSize = `${fontSize}px`;
    }

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'b':
                startTime = video.currentTime;
                updateInfo();
                break;
            case 'n':
                endTime = Math.max(startTime + 0.1, video.currentTime);
                looping = true;
                currentLoop = 0;
                updateInfo();
                restartLoop();
                break;
            case 'h':
                looping = false;
                updateInfo();
                break;
            case 'a':
                adjustTime("start", -1);
                break;
            case 's':
                adjustTime("start", 1);
                break;
            case 'd':
                adjustTime("end", -1);
                break;
            case 'f':
                adjustTime("end", 1);
                break;
            case 'z':
                adjustTime("start", -0.1);
                break;
            case 'x':
                adjustTime("start", 0.1);
                break;
            case 'c':
                adjustTime("end", -0.1);
                break;
            case 'v':
                adjustTime("end", 0.1);
                break;
            case 'j':
                loopCount = Math.max(1, loopCount - 1);
                updateInfo();
                break;
            case 'k':
                loopCount++;
                updateInfo();
                break;
            case '1':
                adjustPlaybackRate(-1);
                break;
            case '2':
                adjustPlaybackRate(-3);
                break;
            case '3':
                adjustPlaybackRate(-5);
                break;
            case '4':
                adjustPlaybackRate(1);
                break;
            case '5':
                adjustPlaybackRate(3);
                break;
            case '6':
                adjustPlaybackRate(5);
                break;
            case 'm':
                toggleInfoDiv();
                break;
            case '+':
                adjustFontSize(1);
                break;
            case '-':
                adjustFontSize(-1);
                break;
            case 't':
                adjustVolume(0.1);
                break;
            case 'g':
                adjustVolume(-0.1);
                break;
            default:
                break;
        }
    });

    // Initial update
    switchTab('info');

    // Clear console
    console.clear();
})();
