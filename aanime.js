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
    video.playbackRate = 0.7;

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
    infoPanel.appendChild(keyHelpDiv);

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
    }

    function updateInfo() {
        let segmentsInfo = segments.map((seg, index) => 
            `Đoạn ${index + 1}: ${formatTime(seg.start)} - ${formatTime(seg.end)} (Tốc độ: ${seg.playbackRate.toFixed(2)}, Lặp lại: ${seg.loopCount})`
        ).join('<br>');

        infoPanel.innerHTML = `
            <p>App Luyện Kaiwa Shadowing + nghe, nói</p>
            <p>PhamHuuTien.com</p>
            <p>Dùng cho web aanime.biz</p>
            <p>cả Tiktok, lẫn Youtube,...</p>
            <p>Âm lượng: ${(video.volume * 100).toFixed(0)}% , Tốc độ: ${video.playbackRate.toFixed(2)}</p>
            <p>Các đoạn đã chọn:</p>
            ${segmentsInfo}
        `;
        infoPanel.appendChild(keyHelpDiv);

        currentInfoPanel.innerHTML = `
            <p>Đoạn hiện tại: ${currentSegmentIndex + 1} / ${segments.length}</p>
            <p>Lặp lại lần: ${currentLoop} / ${segments[currentSegmentIndex]?.loopCount || loopCount}</p>
            <p>Thời gian chờ: ${countdownTime.toFixed(2)}s</p>
        `;
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

    video.addEventListener('timeupdate', loopVideo);

    document.addEventListener('keydown', function(e) {
        const deltaTime = 1; // Thời gian tăng giảm cho điểm bắt đầu và kết thúc (tính bằng giây)
        const deltaTimeSmall = 0.1; // Thời gian tăng giảm nhỏ hơn cho điểm bắt đầu và kết thúc (tính bằng giây)
        const deltaPlaybackRate = 0.01; // Thay đổi tốc độ phát video
        const deltaVolume = 0.1; // Thay đổi âm lượng
        switch (e.key) {
            case 'a':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].start = Math.max(0, segments[currentSegmentIndex].start - deltaTime);
                    updateInfo();
                }
                break;
            case 's':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].start = Math.min(segments[currentSegmentIndex].start + deltaTime, segments[currentSegmentIndex].end);
                    updateInfo();
                }
                break;
            case 'd':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].end = Math.max(segments[currentSegmentIndex].start, segments[currentSegmentIndex].end - deltaTime);
                    updateInfo();
                }
                break;
            case 'f':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].end = Math.min(video.duration, segments[currentSegmentIndex].end + deltaTime);
                    updateInfo();
                }
                break;
            case 'z':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].start = Math.max(0, segments[currentSegmentIndex].start - deltaTimeSmall);
                    updateInfo();
                }
                break;
            case 'x':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].start = Math.min(segments[currentSegmentIndex].start + deltaTimeSmall, segments[currentSegmentIndex].end);
                    updateInfo();
                }
                break;
            case 'c':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].end = Math.max(segments[currentSegmentIndex].start, segments[currentSegmentIndex].end - deltaTimeSmall);
                    updateInfo();
                }
                break;
            case 'v':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].end = Math.min(video.duration, segments[currentSegmentIndex].end + deltaTimeSmall);
                    updateInfo();
                }
                break;
            case 'b':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].start = video.currentTime;
                } else {
                    segments.push({ start: video.currentTime, end: video.duration, playbackRate: video.playbackRate, loopCount });
                    currentSegmentIndex = segments.length - 1;
                }
                updateInfo();
                break;
            case 'n':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].end = video.currentTime;
                }
                updateInfo();
                break;
            case 'Enter':
                looping = true;
                isPaused = false;
                currentSegmentIndex = 0;
                currentLoop = 0;
                video.currentTime = segments[currentSegmentIndex].start;
                video.playbackRate = segments[currentSegmentIndex].playbackRate;
                video.play();
                updateInfo();
                break;
            case 'h':
                looping = false;
                isPaused = true;
                video.pause();
                currentSegmentIndex = -1;
                currentLoop = 0;
                updateInfo();
                break;
            case 'g':
                segments = [];
                currentSegmentIndex = -1;
                currentLoop = 0;
                updateInfo();
                break;
            case 'j':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].loopCount = Math.max(1, segments[currentSegmentIndex].loopCount - 1);
                    updateInfo();
                }
                break;
            case 'k':
                if (segments[currentSegmentIndex]) {
                    segments[currentSegmentIndex].loopCount++;
                    updateInfo();
                }
                break;
            case 'm':
                isHidden = !isHidden;
                infoPanel.style.display = isHidden ? 'none' : 'block';
                buttonPanel.style.display = isHidden ? 'none' : 'block';
                currentInfoPanel.style.display = isHidden ? 'none' : 'block';
                break;
            case '+':
                fontSize++;
                infoPanel.style.fontSize = `${fontSize}px`;
                buttonPanel.style.fontSize = `${fontSize}px`;
                currentInfoPanel.style.fontSize = `${fontSize}px`;
                break;
            case '-':
                fontSize--;
                infoPanel.style.fontSize = `${fontSize}px`;
                buttonPanel.style.fontSize = `${fontSize}px`;
                currentInfoPanel.style.fontSize = `${fontSize}px`;
                break;
            case 'u':
                video.volume = Math.min(1, video.volume + deltaVolume);
                updateInfo();
                break;
            case 'i':
                video.volume = Math.max(0, video.volume - deltaVolume);
                updateInfo();
                break;
            case 'o':
                if (segments.length > 0) {
                    currentSegmentIndex = (currentSegmentIndex - 1 + segments.length) % segments.length;
                    video.currentTime = segments[currentSegmentIndex].start;
                    video.playbackRate = segments[currentSegmentIndex].playbackRate;
                    video.play();
                    updateInfo();
                }
                break;
            case 'p':
                if (segments.length > 0) {
                    currentSegmentIndex = (currentSegmentIndex + 1) % segments.length;
                    video.currentTime = segments[currentSegmentIndex].start;
                    video.playbackRate = segments[currentSegmentIndex].playbackRate;
                    video.play();
                    updateInfo();
                }
                break;
            case 'Delete':
                if (segments.length > 0) {
                    segments.splice(currentSegmentIndex, 1);
                    currentSegmentIndex = Math.min(currentSegmentIndex, segments.length - 1);
                    if (segments.length === 0) {
                        currentSegmentIndex = -1;
                        video.pause();
                    } else {
                        video.currentTime = segments[currentSegmentIndex].start;
                        video.playbackRate = segments[currentSegmentIndex].playbackRate;
                        video.play();
                    }
                    updateInfo();
                }
                break;
            case '1':
            case '2':
            case '3':
                if (segments[currentSegmentIndex]) {
                    const decreaseAmount = parseInt(e.key);
                    segments[currentSegmentIndex].playbackRate = Math.max(0.1, segments[currentSegmentIndex].playbackRate - (decreaseAmount * deltaPlaybackRate));
                    updateInfo();
                }
                break;
            case '4':
            case '5':
            case '6':
                if (segments[currentSegmentIndex]) {
                    const increaseAmount = parseInt(e.key) - 3;
                    segments[currentSegmentIndex].playbackRate = Math.min(3, segments[currentSegmentIndex].playbackRate + (increaseAmount * deltaPlaybackRate));
                    updateInfo();
                }
                break;
            case 'q':
                const segmentNumber = prompt('Nhập số đoạn cần nhảy tới:');
                if (segmentNumber !== null) {
                    const index = parseInt(segmentNumber) - 1;
                    if (!isNaN(index) && index >= 0 && index < segments.length) {
                        currentSegmentIndex = index;
                        video.currentTime = segments[currentSegmentIndex].start;
                        video.playbackRate = segments[currentSegmentIndex].playbackRate;
                        video.play();
                        updateInfo();
                    } else {
                        alert('Số đoạn không hợp lệ.');
                    }
                }
                break;
            case 'e':
                exportSRT();
                break;
            case 'r':
                importSRT();
                break;
            case 'y':
                if (segments[currentSegmentIndex]) {
                    const currentTime = video.currentTime;
                    const currentSegment = segments[currentSegmentIndex];
                    if (currentTime > currentSegment.start && currentTime < currentSegment.end) {
                        const newSegment = {
                            start: currentTime,
                            end: currentSegment.end,
                            playbackRate: currentSegment.playbackRate,
                            loopCount: currentSegment.loopCount
                        };
                        currentSegment.end = currentTime;
                        segments.splice(currentSegmentIndex + 1, 0, newSegment);
                        updateInfo();
                    }
                }
                break;
            default:
                break;
        }
    });

    function exportSRT() {
        let srtContent = '';
        segments.forEach((seg, index) => {
            srtContent += `${index + 1}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\nTốc độ: ${seg.playbackRate.toFixed(2)}, Lặp lại: ${seg.loopCount}\n\n`;
        });
        const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'subtitles.srt';
        link.click();
    }

    function importSRT() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.srt';
        input.addEventListener('change', function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                const srtContent = e.target.result;
                parseSRT(srtContent);
            };
            reader.readAsText(file);
        });
        input.click();
    }

    function parseSRT(srtContent) {
        const srtLines = srtContent.split('\n');
        const newSegments = [];
        let currentSegment = null;

        for (let i = 0; i < srtLines.length; i++) {
            const line = srtLines[i].trim();
            if (/^\d+$/.test(line)) {
                if (currentSegment) {
                    newSegments.push(currentSegment);
                }
                currentSegment = { start: 0, end: 0, playbackRate: 1, loopCount: 1 };
            } else if (/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/.test(line)) {
                const [start, end] = line.split(' --> ');
                currentSegment.start = parseTime(start);
                currentSegment.end = parseTime(end);
            } else if (/^Tốc độ: \d\.\d{2}, Lặp lại: \d+$/.test(line)) {
                const [, playbackRate, loopCount] = /Tốc độ: (\d\.\d{2}), Lặp lại: (\d+)/.exec(line);
                currentSegment.playbackRate = parseFloat(playbackRate);
                currentSegment.loopCount = parseInt(loopCount);
            }
        }
        if (currentSegment) {
            newSegments.push(currentSegment);
        }

        segments = newSegments;
        currentSegmentIndex = -1;
        updateInfo();
    }

    function formatTime(seconds) {
        const date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 12).replace('.', ',');
    }

    function parseTime(timeString) {
        const [hours, minutes, seconds] = timeString.split(':');
        const [secs, ms] = seconds.split(',');
        return (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(secs) + (parseInt(ms) / 1000);
    }
</script>

