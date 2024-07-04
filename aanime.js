(function() {
    let segments = [];
    let currentSegmentIndex = -1;
    let looping = false;
    let loopCount = 3;
    let currentLoop = 0;
    let isPaused = false;
    let isHidden = false;
    let fontSize = 12;
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
    video.playbackRate = 0.5;

    function createPanel(top, left) {
        const panel = document.createElement('div');
        panel.style.position = 'fixed';
        panel.style.top = top;
        panel.style.left = left;
        panel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
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

    const currentInfoPanel = createPanel('10px', '600px');
    currentInfoPanel.style.width = '250px';
    container.appendChild(currentInfoPanel);

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

        element.addEventListener('touchstart', function(e) {
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            initialLeft = parseInt(element.style.left, 10);
            initialTop = parseInt(element.style.top, 10);
        });

        document.addEventListener('touchmove', function(e) {
            if (isDragging) {
                let deltaX = e.touches[0].clientX - dragStartX;
                let deltaY = e.touches[0].clientY - dragStartY;
                element.style.left = `${initialLeft + deltaX}px`;
                element.style.top = `${initialTop + deltaY}px`;
            }
        });

        document.addEventListener('touchend', function() {
            isDragging = false;
        });
    }

    makeDraggable(infoPanel);
    makeDraggable(buttonPanel);
    makeDraggable(currentInfoPanel);

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
        <p>Enter: Bắt đầu lặp lại các đoạn</p>
        <p>h: Dừng quá trình lặp lại</p>
        <p>g: Reset lại các đoạn</p>
        <p>j, k: Giảm/tăng số lần lặp lại của đoạn hiện tại</p>
        <p>m: Ẩn/hiện bảng điều khiển</p>
        <p>+, -: Tăng/giảm kích thước font chữ</p>
        <p>u, i: Tăng/giảm âm lượng</p>
        <p>o, p: Chuyển đến đoạn trước/sau</p>
        <p>Delete: Xóa đoạn hiện tại</p>
        <p>q: Nhảy tới đoạn được chỉ định</p>
        <p>e: Xuất file phụ đề</p>
        <p>r: Nhập file phụ đề</p>
        <p>y: Chia đoạn tại thời điểm hiện tại</p>
    `;

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
    }

    function updateInfo() {
        let segmentsInfo = segments.map((seg, index) => {
            const isCurrentSegment = index === currentSegmentIndex;
            const segmentStyle = isCurrentSegment ? 'color: #FFD700; font-weight: bold;' : '';
            return `<div id="segment-${index}" style="${segmentStyle}">
                Đoạn ${index + 1}: ${formatTime(seg.start)} - ${formatTime(seg.end)}<br>
                (Tốc độ: ${seg.playbackRate.toFixed(2)}, Lặp lại: ${seg.loopCount})
            </div>`;
        }).join('<br>');

        infoPanel.innerHTML = `
            <p>App Luyện Kaiwa Shadowing</p>
            <p>PhamHuuTien.com</p>
            <p>Dùng cho web aanime.biz</p>
            <p>cả Tiktok, lẫn Youtube,...</p>
            <p>Âm lượng: ${(video.volume * 100).toFixed(0)}% , Tốc độ: ${video.playbackRate.toFixed(2)}</p>
            <p>Các đoạn đã chọn:</p>
            <div id="segments-container" style="max-height: 200px; overflow-y: auto;">
                ${segmentsInfo}
            </div>
        `;
        infoPanel.appendChild(keyHelpDiv);

        currentInfoPanel.innerHTML = `
            <p>Đoạn hiện tại: ${currentSegmentIndex + 1} / ${segments.length}</p>
            <p>Lặp lại lần: ${currentLoop} / ${segments[currentSegmentIndex]?.loopCount || loopCount}</p>
            <p>Thời gian tập nói: ${countdownTime.toFixed(2)}s</p>
        `;

        const segmentsContainer = document.getElementById('segments-container');
        const currentSegmentElement = document.getElementById(`segment-${currentSegmentIndex}`);
        if (segmentsContainer && currentSegmentElement) {
            segmentsContainer.scrollTop = currentSegmentElement.offsetTop - segmentsContainer.offsetTop;
        }
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
                const pauseDuration = segmentDuration * 1.2;
                countdownTime = pauseDuration;
                startCountdown();
                if (currentLoop < currentSegment.loopCount) {
                    setTimeout(() => {
                        video.currentTime = currentSegment.start;
                        video.playbackRate = currentSegment.playbackRate;
                        isPaused = false;
                        video.play();
                    }, pauseDuration * 1000);
                } else {
                    currentLoop = 0;
                    currentSegmentIndex = (currentSegmentIndex + 1) % segments.length;
                    setTimeout(() => {
                        video.currentTime = segments[currentSegmentIndex].start;
                        video.playbackRate = segments[currentSegmentIndex].playbackRate;
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
            video.playbackRate = segments[currentSegmentIndex].playbackRate;
            isPaused = false;
            video.play();
        }, 1000);
    }

    function resetSegments() {
        isPaused = true;
        video.pause();
        segments = [];
        currentSegmentIndex = -1;
        currentLoop = 0;
        looping = false;
        updateInfo();
    }

    video.addEventListener('timeupdate', loopVideo);

    function adjustTime(type, delta) {
        if (segments.length === 0 || currentSegmentIndex === -1) return;
        let currentSegment = segments[currentSegmentIndex];
        if (type === "start") {
            currentSegment.start = Math.max(0, currentSegment.start + delta);
            if (currentSegment.start >= currentSegment.end) {
                currentSegment.start = currentSegment.end - 0.1;
            }
            if (video.currentTime < currentSegment.start) {
                video.currentTime = currentSegment.start;
            }
        } else if (type === "end") {
            currentSegment.end = Math.max(currentSegment.start + 0.1, currentSegment.end + delta);
        }
        updateInfo();
    }

    function adjustPlaybackRate(delta) {
        if (segments.length === 0 || currentSegmentIndex === -1) return;
        let currentSegment = segments[currentSegmentIndex];
        currentSegment.playbackRate = Math.max(0.1, currentSegment.playbackRate * (1 + delta / 100));
        video.playbackRate = currentSegment.playbackRate;
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
        currentInfoPanel.style.fontSize = `${fontSize}px`;
    }

    function changeSegment(delta) {
        if (segments.length === 0) return;
        currentSegmentIndex = (currentSegmentIndex + delta + segments.length) % segments.length;
        currentLoop = 0;
        video.currentTime = segments[currentSegmentIndex].start;
        video.playbackRate = segments[currentSegmentIndex].playbackRate;
        updateInfo();
    }

    function deleteCurrentSegment() {
        if (segments.length === 0 || currentSegmentIndex === -1) return;
        segments.splice(currentSegmentIndex, 1);
        if (segments.length === 0) {
            currentSegmentIndex = -1;
        } else {
            currentSegmentIndex = Math.min(currentSegmentIndex, segments.length - 1);
        }
        updateInfo();
    }

    function jumpToSegment() {
        const segmentNumber = prompt("Enter the segment number to jump to:");
        if (segmentNumber !== null) {
            const index = parseInt(segmentNumber) - 1;
            if (index >= 0 && index < segments.length) {
                currentSegmentIndex = index;
                video.currentTime = segments[currentSegmentIndex].start;
                video.playbackRate = segments[currentSegmentIndex].playbackRate;
                updateInfo();
            } else {
                alert("Invalid segment number");
            }
        }
    }

    function exportSubtitles() {
        let srtContent = "";
        segments.forEach((segment, index) => {
            srtContent += `${index + 1}\n`;
            srtContent += `${formatTime(segment.start)} --> ${formatTime(segment.end)}\n`;
            srtContent += `Segment ${index + 1}\n\n`;
        });

        const blob = new Blob([srtContent], {type: "text/plain;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "subtitles.srt";
        link.click();
        URL.revokeObjectURL(url);
    }
function importSubtitles() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.srt';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = readerEvent => {
                const content = readerEvent.target.result;
                const parsedSegments = parseSRT(content);
                if (parsedSegments.length > 0) {
                    segments = parsedSegments;
                    currentSegmentIndex = 0;
                    updateInfo();
                    alert("Subtitles imported successfully!");
                } else {
                    alert("Failed to import subtitles. Please check the file format.");
                }
            }
        }
        input.click();
    }

    function parseSRT(content) {
        const lines = content.trim().split('\n');
        const parsedSegments = [];
        let currentSegment = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;

            if (line.includes('-->')) {
                const [start, end] = line.split('-->').map(timeStr => {
                    const [h, m, s] = timeStr.trim().split(':');
                    const [seconds, milliseconds] = s.replace(',', '.').split('.');
                    return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(`${seconds}.${milliseconds}`);
                });
                currentSegment.start = start;
                currentSegment.end = end;
                currentSegment.playbackRate = 0.5;  // Tốc độ mặc định 50%
                currentSegment.loopCount = loopCount;
                parsedSegments.push(currentSegment);
                currentSegment = {};
            }
        }

        return parsedSegments;
    }

    function adjustSegmentLoopCount(delta) {
        if (segments.length === 0 || currentSegmentIndex === -1) return;
        let currentSegment = segments[currentSegmentIndex];
        currentSegment.loopCount = Math.max(1, currentSegment.loopCount + delta);
        updateInfo();
    }

    function splitSegmentAtCurrentTime() {
        if (segments.length === 0 || currentSegmentIndex === -1) return;
        let currentSegment = segments[currentSegmentIndex];
        if (video.currentTime > currentSegment.start && video.currentTime < currentSegment.end) {
            let newSegment = {
                start: video.currentTime,
                end: currentSegment.end,
                playbackRate: currentSegment.playbackRate,
                loopCount: currentSegment.loopCount
            };
            currentSegment.end = video.currentTime;
            segments.splice(currentSegmentIndex + 1, 0, newSegment);
            updateInfo();
        }
    }

    function createButton(label, onClick, tooltip) {
    const button = document.createElement('button');
    button.innerText = label;
    button.style.margin = '4px';
    button.style.padding = '10px';
    button.style.width = '60px';
    button.style.fontSize = '32px';
    button.style.cursor = 'pointer';
    button.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    button.style.color = '#FFD700';
    button.style.border = '1px solid white';
    button.style.borderRadius = '5px';
    button.addEventListener('click', onClick);
    
    // Thêm tooltip
    button.title = tooltip;
    
    // Thêm hiệu ứng khi hover
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    });
    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    });
    
    // Thêm hiệu ứng khi nhấn giữ
    button.addEventListener('mousedown', () => {
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    });
    button.addEventListener('mouseup', () => {
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    });
    
    buttonPanel.appendChild(button);
}
createButton('h', () => {
    looping = false;
    isPaused = true;
    video.pause();
    clearInterval(countdownInterval);
    updateInfo();
}, 'Dừng quá trình lặp lại');

createButton('g', resetSegments, 'Reset lại các đoạn');

createButton('b', () => {
    segments.push({
        start: video.currentTime - 0.15,
        end: video.currentTime,
        playbackRate: 0.5,
        loopCount: loopCount
    });
    currentSegmentIndex = segments.length - 1;
    updateInfo();
}, 'Đặt điểm bắt đầu tại thời điểm hiện tại');

createButton('n', () => {
    if (segments.length > 0) {
        segments[currentSegmentIndex].end = Math.max(segments[currentSegmentIndex].start + 0.1, video.currentTime);
        updateInfo();
    }
}, 'Đặt điểm kết thúc cho đoạn hiện tại');

createButton('Enter', () => {
    if (segments.length > 0) {
        looping = true;
        currentLoop = 0;
        currentSegmentIndex = 0;
        updateInfo();
        restartLoop();
    }
}, 'Bắt đầu lặp lại các đoạn');

createButton('a', () => adjustTime("start", -1), 'Giảm điểm bắt đầu 1s');
createButton('s', () => adjustTime("start", 1), 'Tăng điểm bắt đầu 1s');
createButton('d', () => adjustTime("end", -1), 'Giảm điểm kết thúc 1s');
createButton('f', () => adjustTime("end", 1), 'Tăng điểm kết thúc 1s');
createButton('z', () => adjustTime("start", -0.1), 'Giảm điểm bắt đầu 0.1s');
createButton('x', () => adjustTime("start", 0.1), 'Tăng điểm bắt đầu 0.1s');
createButton('c', () => adjustTime("end", -0.1), 'Giảm điểm kết thúc 0.1s');
createButton('v', () => adjustTime("end", 0.1), 'Tăng điểm kết thúc 0.1s');
createButton('1', () => adjustPlaybackRate(-1), 'Giảm tốc độ 1%');
createButton('2', () => adjustPlaybackRate(-2), 'Giảm tốc độ 2%');
createButton('3', () => adjustPlaybackRate(-3), 'Giảm tốc độ 3%');
createButton('4', () => adjustPlaybackRate(1), 'Tăng tốc độ 1%');
createButton('5', () => adjustPlaybackRate(2), 'Tăng tốc độ 2%');
createButton('6', () => adjustPlaybackRate(3), 'Tăng tốc độ 3%');
createButton('m', () => toggleInfoDiv(), 'Ẩn/hiện bảng điều khiển');
createButton('u', () => adjustVolume(0.01), 'Tăng âm lượng');
createButton('i', () => adjustVolume(-0.01), 'Giảm âm lượng');
createButton('o', () => changeSegment(-1), 'Chuyển đến đoạn trước');
createButton('p', () => changeSegment(1), 'Chuyển đến đoạn sau');
createButton('Del', deleteCurrentSegment, 'Xóa đoạn hiện tại');
createButton('q', jumpToSegment, 'Nhảy tới đoạn được chỉ định');
createButton('e', exportSubtitles, 'Xuất file phụ đề');
createButton('r', importSubtitles, 'Nhập file phụ đề');
createButton('j', () => adjustSegmentLoopCount(-1), 'Giảm số lần lặp lại của đoạn hiện tại');
createButton('k', () => adjustSegmentLoopCount(1), 'Tăng số lần lặp lại của đoạn hiện tại');
createButton('y', splitSegmentAtCurrentTime, 'Chia đoạn tại thời điểm hiện tại');

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'b':
                segments.push({
                    start: video.currentTime - 0.15,
                    end: video.currentTime,
                    playbackRate: 0.5,  // Tốc độ mặc định 50%
                    loopCount: loopCount
                });
                currentSegmentIndex = segments.length - 1;
                updateInfo();
                break;
            case 'n':
                if (segments.length > 0) {
                    segments[currentSegmentIndex].end = Math.max(segments[currentSegmentIndex].start + 0.1, video.currentTime);
                    updateInfo();
                }
                break;
            case 'Enter':
                if (segments.length > 0) {
                    looping = true;
                    currentLoop = 0;
                    currentSegmentIndex = 0;
                    updateInfo();
                    restartLoop();
                }
                break;
            case 'h':
                looping = false;
                isPaused = true;
                video.pause();
                clearInterval(countdownInterval);
                updateInfo();
                break;
            case 'g':
                resetSegments();
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
            case 'Delete':
                deleteCurrentSegment();
                break;
            case 'q':
                jumpToSegment();
                break;
            case 'e':
                exportSubtitles();
                break;
            case 'r':
                importSubtitles();
                break;
            case 'j':
                adjustSegmentLoopCount(-1);
                break;
            case 'k':
                adjustSegmentLoopCount(1);
                break;
            case 'y':
                splitSegmentAtCurrentTime();
                break;
            default:
                break;
        }
    });

    updateInfo();
    console.clear();
})();
