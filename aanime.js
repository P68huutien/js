javascript:(function() {
    let segments = [];
    let currentSegmentIndex = -1;
    let looping = false;
    let loopCount = 50;
    let currentLoop = 0;
    let isPaused = false;
    let isHidden = false;
    let fontSize = 14;
    let countdownTime = 0;
    let countdownInterval;
    let hKeyPressCount = 0;

    function findSuitableContainer() {
        const possibleContainers = [
            document.querySelector('.tiktok-1qb12g8-DivThreeColumnContainer'),
            document.querySelector('.tiktok-ywuvyb-DivBodyContainer'),
            document.querySelector('main'),
            document.body
        ];
        return possibleContainers.find(container => container !== null);
    }

    const container = findSuitableContainer();

    const video = document.querySelector('video');
    if (!video) {
        alert('Không tìm thấy video trên trang.');
        return;
    }

    video.volume = 0.5;
    video.playbackRate = 0.8;

    function createPanel(top, left) {
        const panel = document.createElement('div');
        panel.style.position = 'fixed';
        panel.style.top = top;
        panel.style.left = left;
        panel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        panel.style.color = 'white';
        panel.style.padding = '10px';
        panel.style.borderRadius = '5px';
        panel.style.zIndex = '2147483647';
        panel.style.fontSize = `${fontSize}px`;
        panel.style.maxHeight = '80vh';
        panel.style.overflowY = 'auto';
        return panel;
    }

    const infoPanel = createPanel('10px', '10px');
    infoPanel.style.width = '300px';
    container.appendChild(infoPanel);

    const buttonPanel = createPanel('10px', '320px');
    buttonPanel.style.width = 'auto';
    container.appendChild(buttonPanel);

    function makeDraggable(element) {
        let isDragging = false;
        let dragStartX, dragStartY, initialLeft, initialTop;

        element.addEventListener('mousedown', function(e) {
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            initialLeft = parseInt(element.style.left, 10);
            initialTop = parseInt(element.style.top, 10);
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                let deltaX = e.clientX - dragStartX;
                let deltaY = e.clientY - dragStartY;
                element.style.left = `${initialLeft + deltaX}px`;
                element.style.top = `${initialTop + deltaY}px`;
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
    }

    makeDraggable(infoPanel);
    makeDraggable(buttonPanel);

    const keyHelpDiv = document.createElement('div');
    keyHelpDiv.innerHTML = `
        <p>Phím hướng dẫn:</p>
        <p>1, 2, 3: Giảm tốc độ -1,-2,-3%</p>
        <p>4, 5, 6: Tăng tốc độ +1,+2,+3%</p>
        <p>a, s: Điều chỉnh điểm bắt đầu (-1s, +1s)</p>
        <p>d, f: Điều chỉnh điểm kết thúc (-1s, +1s)</p>
        <p>z, x: Điều chỉnh điểm bắt đầu (-0.1s, +0.1s)</p>
        <p>c, v: Điều chỉnh điểm kết thúc (-0.1s, +0.1s)</p>
        <p>b: Đặt điểm bắt đầu tại thời điểm hiện tại</p>
        <p>n: Đặt điểm kết thúc cho đoạn hiện tại</p>
        <p>l: Bắt đầu lặp lại các đoạn</p>
        <p>h: Hủy quá trình lặp lại / Bắt đầu lại</p>
        <p>j, k: Tăng/giảm số lần lặp lại, mặc định 50</p>
        <p>m: Ẩn/hiện bảng điều khiển</p>
        <p>+, -: Tăng/giảm kích thước font chữ</p>
        <p>u, i: Tăng/giảm âm lượng</p>
        <p>o, p: Chuyển đến đoạn trước/sau</p>
    `;
    infoPanel.appendChild(keyHelpDiv);

    function updateInfo() {
        let segmentsInfo = segments.map((seg, index) => 
            `Đoạn ${index + 1}: ${seg.start.toFixed(2)}s - ${seg.end.toFixed(2)}s`
        ).join('<br>');

        infoPanel.innerHTML = `
            <p>App Luyện Kaiwa Shadowing + nghe, nói</p>
            <p>PhamHuuTien.com</p>
            <p>Dùng cho web aanime.biz</p>
            <p>cả Tiktok, lẫn Youtube,...</p>
            <p>Âm lượng: ${(video.volume * 100).toFixed(0)}% , Tốc độ: ${video.playbackRate.toFixed(2)}</p>
            <p>Các đoạn đã chọn:</p>
            ${segmentsInfo}
            <p>Đoạn hiện tại: ${currentSegmentIndex + 1} / ${segments.length}</p>
            <p>Lặp lại lần: ${currentLoop} / ${loopCount}</p>
            <p>Thời gian chờ: ${countdownTime.toFixed(2)}s</p>                   
        `;
        infoPanel.appendChild(keyHelpDiv);
    }

    function loopVideo() {
        if (looping && !isPaused) {
            let currentSegment = segments[currentSegmentIndex];
            if (video.currentTime >= currentSegment.end) {
                isPaused = true;
                video.pause();
                currentLoop++;
                updateInfo();
                const segmentDuration = currentSegment.end - currentSegment.start;
                const pauseDuration = segmentDuration * 2;
                countdownTime = pauseDuration;
                startCountdown();
                if (currentLoop < loopCount) {
                    setTimeout(() => {
                        video.currentTime = currentSegment.start;
                        isPaused = false;
                        video.play();
                    }, pauseDuration * 1000);
                } else {
                    currentLoop = 0;
                    currentSegmentIndex = (currentSegmentIndex + 1) % segments.length;
                    setTimeout(() => {
                        video.currentTime = segments[currentSegmentIndex].start;
                        isPaused = false;
                        video.play();
                    }, pauseDuration * 1000);
                }
            }
        }
    }

    function startCountdown() {
        clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            countdownTime -= 0.1;
            if (countdownTime <= 0) {
                clearInterval(countdownInterval);
            }
            updateInfo();
        }, 100);
    }

    function restartLoop() {
        isPaused = true;
        video.pause();
        currentLoop = 0;
        currentSegmentIndex = 0;
        updateInfo();
        setTimeout(() => {
            video.currentTime = segments[currentSegmentIndex].start;
            isPaused = false;
            video.play();
        }, 1000);
    }

    video.addEventListener('timeupdate', loopVideo);

    function adjustTime(type, delta) {
        if (segments.length === 0 || currentSegmentIndex === -1) return;
        let currentSegment = segments[currentSegmentIndex];
        if (type === "start") {
            currentSegment.start = Math.max(0, currentSegment.start + delta);
            updateInfo();
            if (video.currentTime < currentSegment.start) {
                video.currentTime = currentSegment.start;
            }
        } else if (type === "end") {
            currentSegment.end = Math.max(currentSegment.start + 0.1, currentSegment.end + delta);
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
        keyHelpDiv.style.display = isHidden ? 'none' : 'block';
    }

    function adjustFontSize(delta) {
        fontSize = Math.max(10, fontSize + delta);
        infoPanel.style.fontSize = `${fontSize}px`;
        buttonPanel.style.fontSize = `${fontSize}px`;
    }

    function changeSegment(delta) {
        if (segments.length === 0) return;
        currentSegmentIndex = (currentSegmentIndex + delta + segments.length) % segments.length;
        currentLoop = 0;
        video.currentTime = segments[currentSegmentIndex].start;
        updateInfo();
    }

    function createButton(label, onClick) {
        const button = document.createElement('button');
        button.innerText = label;
        button.style.margin = '2px';
        button.style.padding = '5px';
        button.style.width = '30px';
        button.style.fontSize = '16px';
        button.style.cursor = 'pointer';
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        button.style.color = 'white';
        button.style.border = '1px solid white';
        button.style.borderRadius = '5px';
        button.addEventListener('click', onClick);
        buttonPanel.appendChild(button);
    }

    createButton('h', () => {
        hKeyPressCount++;
        looping = hKeyPressCount % 2 === 0;
        updateInfo();
        if (!looping) {
            clearInterval(countdownInterval);
        } else {
            restartLoop();
        }
    });
    createButton('b', () => {
        segments.push({start: video.currentTime - 0.15, end: video.currentTime});
        currentSegmentIndex = segments.length - 1;
        updateInfo();
    });
    createButton('n', () => {
        if (segments.length > 0) {
            segments[currentSegmentIndex].end = Math.max(segments[currentSegmentIndex].start + 0.1, video.currentTime);
            updateInfo();
        }
    });
    createButton('l', () => {
        if (segments.length > 0) {
            looping = true;
            currentLoop = 0;
            currentSegmentIndex = 0;
            updateInfo();
            restartLoop();
        }
    });
    createButton('a', () => adjustTime("start", -1));
    createButton('s', () => adjustTime("start", 1));
    createButton('d', () => adjustTime("end", -1));
    createButton('f', () => adjustTime("end", 1));
    createButton('z', () => adjustTime("start", -0.1));
    createButton('x', () => adjustTime("start", 0.1));
    createButton('c', () => adjustTime("end", -0.1));
    createButton('v', () => adjustTime("end", 0.1));
    createButton('1', () => adjustPlaybackRate(-1));
    createButton('2', () => adjustPlaybackRate(-2));
    createButton('3', () => adjustPlaybackRate(-3));
    createButton('4', () => adjustPlaybackRate(1));
    createButton('5', () => adjustPlaybackRate(2));
    createButton('6', () => adjustPlaybackRate(3));
    createButton('m', () => toggleInfoDiv());
    createButton('u', () => adjustVolume(0.01));
    createButton('i', () => adjustVolume(-0.01));
    createButton('o', () => changeSegment(-1));
    createButton('p', () => changeSegment(1));

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'b':
                segments.push({start: video.currentTime - 0.15, end: video.currentTime});
                currentSegmentIndex = segments.length - 1;
                updateInfo();
                break;
            case 'n':
                if (segments.length > 0) {
                    segments[currentSegmentIndex].end = Math.max(segments[currentSegmentIndex].start + 0.1, video.currentTime);
                    updateInfo();
                }
                break;
            case 'l':
                if (segments.length > 0) {
                    looping = true;
                    currentLoop = 0;
                    currentSegmentIndex = 0;
                    updateInfo();
                    restartLoop();
                }
                break;
            case 'h':
                hKeyPressCount++;
                looping = hKeyPressCount % 2 === 0;
                updateInfo();
                if (!looping) {
                    clearInterval(countdownInterval);
                } else {
                    restartLoop();
                }
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
            case '1':
                adjustPlaybackRate(-1);
                break;
            case '2':
                adjustPlaybackRate(-2);
                break;
            case '3':
                adjustPlaybackRate(-3);
                break;
            case '4':
                adjustPlaybackRate(1);
                break;
            case '5':
                adjustPlaybackRate(2);
                break;
            case '6':
                adjustPlaybackRate(3);
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
            case 'u':
                adjustVolume(0.01);
                break;
            case 'i':
                adjustVolume(-0.01);
                break;
            case 'o':
                changeSegment(-1);
                break;
            case 'p':
                changeSegment(1);
                break;
            default:
                break;
        }
    });

    updateInfo();
    console.clear();
})();
