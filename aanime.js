javascript:(function(){
    let startTime = 0;
    let endTime = 0;
    let looping = false;
    let loopCount = 50;
    let currentLoop = 0;
    let isPaused = false;
    let isHidden = false;
    let fontSize = 14; // Font size for buttons
    let buttonSize = 20; // Button size (height and width)
    let countdownTime = 0;
    let countdownInterval;
    let hKeyPressCount = 0; // Counter for "h" key presses

    const video = document.querySelector('video');
    video.volume = 0.5; // Set initial volume to 50%
    video.playbackRate = 0.8; // Set initial playback speed to 80%

    // Create HTML element to display info
    const infoDiv = document.createElement('div');
    infoDiv.style.position = 'fixed';
    infoDiv.style.top = '10px';
    infoDiv.style.left = '10px';
    infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    infoDiv.style.color = 'white';
    infoDiv.style.padding = '10px';
    infoDiv.style.borderRadius = '5px';
    infoDiv.style.zIndex = '1000';
    infoDiv.style.resize = 'both';
    infoDiv.style.overflow = 'auto';
    infoDiv.style.fontSize = `${fontSize}px`; // Set initial font size for infoDiv
    infoDiv.style.cursor = 'move';
    document.body.appendChild(infoDiv);

    // Create a container for the buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.top = '300px';
    buttonContainer.style.left = '10px';
    buttonContainer.style.zIndex = '999'; // Lower zIndex to not cover infoDiv
    buttonContainer.style.display = 'grid';
    buttonContainer.style.gridTemplateColumns = 'repeat(4, auto)';
    buttonContainer.style.gridTemplateRows = 'repeat(5, auto)';
    buttonContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    buttonContainer.style.padding = '10px';
    buttonContainer.style.borderRadius = '5px';
    buttonContainer.style.gap = '5px';
    document.body.appendChild(buttonContainer);

    let isDragging = false;
    let dragStartX, dragStartY, initialLeft, initialTop;

    infoDiv.addEventListener('mousedown', function(e) {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initialLeft = parseInt(infoDiv.style.left, 10);
        initialTop = parseInt(infoDiv.style.top, 10);
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            let deltaX = e.clientX - dragStartX;
            let deltaY = e.clientY - dragStartY;
            infoDiv.style.left = `${initialLeft + deltaX}px`;
            infoDiv.style.top = `${initialTop + deltaY}px`;
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    // Create a container for the key help info
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
        <p>n: Đặt điểm kết thúc và bắt đầu lặp lại</p>
        <p>h: Hủy quá trình lặp lại / Bắt đầu lại</p>
        <p>m: Ẩn/hiện bảng điều khiển</p>
        <p>k: Lưu công việc hiện tại và đưa về 0</p>
        <p>j: Mở danh sách công việc đã lưu</p>
    `;
    infoDiv.appendChild(keyHelpDiv);

    function updateInfo() {
        infoDiv.innerHTML = `
            <p>App Luyện Kaiwa Shadowing + nghe, nói</p>
            <p>Dùng cho web aanime.biz, tsunagarujp,</p>
            <p>cả Tiktok, lẫn Youtube,...</p>
            <p>Tốc độ phát: ${video.playbackRate.toFixed(2)}</p>
            <p>Thời gian bắt đầu: ${startTime.toFixed(2)}s</p>
            <p>Thời gian kết thúc: ${endTime.toFixed(2)}s</p>
            <p>Lặp lại lần: ${currentLoop} / ${loopCount}</p>
            <p>Thời gian chờ: ${countdownTime.toFixed(2)}s</p>
            <p>Âm lượng: ${(video.volume * 100).toFixed(0)}%</p>            
        `;
        infoDiv.appendChild(keyHelpDiv);  // Append keyHelpDiv to infoDiv
    }

    function loopVideo() {
        if (looping && video.currentTime >= endTime && !isPaused) {
            isPaused = true;
            video.pause();
            currentLoop++;
            updateInfo();  // Update info
            const segmentDuration = endTime - startTime;
            const pauseDuration = segmentDuration * 2 + 1;
            countdownTime = pauseDuration;
            startCountdown();
            if (currentLoop < loopCount) {
                setTimeout(() => {
                    video.currentTime = startTime;
                    isPaused = false;
                    video.play();
                }, pauseDuration * 1000);
            } else {
                looping = false;
                console.log("Hoàn thành lặp lại.");
                clearInterval(countdownInterval);
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
        updateInfo();  // Update info
    }

    function createButton(label, onClick) {
        const button = document.createElement('button');
        button.innerText = label;
        button.style.margin = '5px';
        button.style.padding = '10px';
        button.style.fontSize = `${fontSize}px`; // Set font size for button
        button.style.width = `${buttonSize * 2}px`; // Set width of the button (doubled)
        button.style.height = `${buttonSize * 2}px`; // Set height of the button (doubled)
        button.style.cursor = 'pointer';
        button.style.backgroundColor = 'white';
        button.style.color = 'black';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.addEventListener('click', onClick);
        buttonContainer.appendChild(button);
    }

    // Create buttons with specified labels and onClick functions
    ['h', 'b', 'n', 'm', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v', '1', '2', '3', 'k', '4', '5', '6', 'j'].forEach(label => {
        createButton(label, () => {
            switch (label) {
                case 'b':
                    startTime = video.currentTime - 0.15;
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
                case 'k':
                    // Save current work and reset
                    console.log("Saving current work...");
                    break;
                case 'j':
                    // Open the list of saved works
                    console.log("Opening saved works...");
                    break;
                default:
                    break;
            }
        });
    });

    // Update initial info
    updateInfo();

    // Clear console
    console.clear();
})();
