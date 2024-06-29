(function() {
    let segments = [];
    let currentSegmentIndex = -1;
    let looping = false;
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
        <p>g: Reset lại các đoạn</p>
        <p>j, k: Tăng/giảm số lần lặp lại của đoạn hiện tại</p>
        <p>m: Ẩn/hiện bảng điều khiển</p>
        <p>+, -: Tăng/giảm kích thước font chữ</p>
        <p>u, i: Tăng/giảm âm lượng</p>
        <p>o, p: Chuyển đến đoạn trước/sau</p>
        <p>Delete: Xóa đoạn hiện tại</p>
        <p>q: Nhảy tới đoạn được chỉ định</p>
        <p>e: Xuất file phụ đề</p>
        <p>r: Nhập file phụ đề</p>
    `;
    infoPanel.appendChild(keyHelpDiv);

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
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
            <p>Đoạn hiện tại: ${currentSegmentIndex + 1} / ${segments.length}</p>
            <p>Lặp lại lần: ${currentLoop} / ${segments[currentSegmentIndex]?.loopCount || 0}</p>
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
                countdownTime = currentSegment.end - currentSegment.start;
                startCountdown();
                if (currentLoop < currentSegment.loopCount) {
                    setTimeout(() => {
                        video.currentTime = currentSegment.start;
                        video.playbackRate = currentSegment.playbackRate;
                        isPaused = false;
                        video.play();
                    }, countdownTime * 1000);
                } else {
                    currentLoop = 0;
                    currentSegmentIndex = (currentSegmentIndex + 1) % segments.length;
                    setTimeout(() => {
                        video.currentTime = segments[currentSegmentIndex].start;
                        video.playbackRate = segments[currentSegmentIndex].playbackRate;
                        isPaused = false;
                        video.play();
                    }, countdownTime * 1000);
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
            updateInfo();
            if (video.currentTime < currentSegment.start) {
                video.currentTime = currentSegment.start;
            }
        } else if (type === "end") {
            currentSegment.end = Math.max(currentSegment.start + 0.1, currentSegment.end + delta);
            updateInfo();
        }
    }

    function jumpToSegment(index) {
        if (index >= 0 && index < segments.length) {
            isPaused = true;
            video.pause();
            currentSegmentIndex = index;
            currentLoop = 0;
            updateInfo();
            setTimeout(() => {
                video.currentTime = segments[currentSegmentIndex].start;
                video.playbackRate = segments[currentSegmentIndex].playbackRate;
                isPaused = false;
                video.play();
            }, 1000);
        }
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'a') {
            adjustTime("start", -1);
        } else if (event.key === 's') {
            adjustTime("start", 1);
        } else if (event.key === 'd') {
            adjustTime("end", -1);
        } else if (event.key === 'f') {
            adjustTime("end", 1);
        } else if (event.key === 'z') {
            adjustTime("start", -0.1);
        } else if (event.key === 'x') {
            adjustTime("start", 0.1);
        } else if (event.key === 'c') {
            adjustTime("end", -0.1);
        } else if (event.key === 'v') {
            adjustTime("end", 0.1);
        } else if (event.key === 'b') {
            if (segments.length === 0 || segments[currentSegmentIndex]?.end) {
                segments.push({ start: video.currentTime, end: null, loopCount: 4, playbackRate: video.playbackRate });
                currentSegmentIndex = segments.length - 1;
            } else {
                segments[currentSegmentIndex].start = video.currentTime;
            }
            updateInfo();
        } else if (event.key === 'n') {
            if (currentSegmentIndex !== -1 && !segments[currentSegmentIndex].end) {
                segments[currentSegmentIndex].end = video.currentTime;
                updateInfo();
            }
        } else if (event.key === 'l') {
            if (segments.length > 0 && !looping) {
                looping = true;
                currentSegmentIndex = 0;
                currentLoop = 0;
                updateInfo();
                video.currentTime = segments[0].start;
                video.playbackRate = segments[0].playbackRate;
                video.play();
            }
        } else if (event.key === 'h') {
            hKeyPressCount++;
            if (hKeyPressCount === 1) {
                alert('Bạn có chắc muốn hủy lặp lại? Nếu chắc chắn, nhấn phím H lần nữa.');
                setTimeout(() => {
                    hKeyPressCount = 0;
                }, 5000);
            } else if (hKeyPressCount === 2) {
                looping = false;
                restartLoop();
                hKeyPressCount = 0;
            }
        } else if (event.key === 'g') {
            resetSegments();
        } else if (event.key === 'j') {
            if (segments.length > 0) {
                segments[currentSegmentIndex].loopCount = Math.max(1, segments[currentSegmentIndex].loopCount + 1);
                updateInfo();
            }
        } else if (event.key === 'k') {
            if (segments.length > 0) {
                segments[currentSegmentIndex].loopCount = Math.max(1, segments[currentSegmentIndex].loopCount - 1);
                updateInfo();
            }
        } else if (event.key === 'm') {
            isHidden = !isHidden;
            infoPanel.style.display = isHidden ? 'none' : 'block';
        } else if (event.key === 'u') {
            video.volume = Math.min(1, video.volume + 0.1);
            updateInfo();
        } else if (event.key === 'i') {
            video.volume = Math.max(0, video.volume - 0.1);
            updateInfo();
        } else if (event.key === 'o') {
            if (currentSegmentIndex > 0) {
                jumpToSegment(currentSegmentIndex - 1);
            }
        } else if (event.key === 'p') {
            if (currentSegmentIndex < segments.length - 1) {
                jumpToSegment(currentSegmentIndex + 1);
            }
        } else if (event.key === 'Delete') {
            if (currentSegmentIndex !== -1) {
                segments.splice(currentSegmentIndex, 1);
                if (currentSegmentIndex >= segments.length) {
                    currentSegmentIndex = segments.length - 1;
                }
                updateInfo();
            }
        } else if (event.key === '+') {
            fontSize++;
            infoPanel.style.fontSize = `${fontSize}px`;
            updateInfo();
        } else if (event.key === '-') {
            fontSize = Math.max(8, fontSize - 1);
            infoPanel.style.fontSize = `${fontSize}px`;
            updateInfo();
        } else if (event.key === 'q') {
            let segmentNumber = prompt("Nhập số thứ tự của đoạn:");
            if (segmentNumber !== null) {
                segmentNumber = parseInt(segmentNumber, 10) - 1;
                if (segmentNumber >= 0 && segmentNumber < segments.length) {
                    jumpToSegment(segmentNumber);
                } else {
                    alert('Số đoạn không hợp lệ.');
                }
            }
        } else if (event.key === 'e') {
            const subtitles = segments.map((seg, index) => {
                return `${index + 1}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\nLoop Count: ${seg.loopCount}, Playback Rate: ${seg.playbackRate.toFixed(2)}\n`;
            }).join('\n');
            const blob = new Blob([subtitles], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'subtitles.srt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else if (event.key === 'r') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.srt';
            input.onchange = function(event) {
                const file = event.target.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    const contents = e.target.result;
                    const segments = contents.split('\n\n').map(segment => {
                        const lines = segment.split('\n');
                        const index = parseInt(lines[0], 10);
                        const times = lines[1].split(' --> ');
                        const start = parseSRTTime(times[0]);
                        const end = parseSRTTime(times[1]);
                        const loopCount = parseInt(lines[2].split(': ')[1], 10);
                        const playbackRate = parseFloat(lines[3].split(': ')[1]);
                        return { start, end, loopCount, playbackRate };
                    });
                    this.segments = segments;
                    updateInfo();
                }.bind(this);
                reader.readAsText(file);
            }.bind(this);
            input.click();
        }
    });

    function parseSRTTime(srtTime) {
        const parts = srtTime.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const secondsParts = parts[2].split(',');
        const seconds = parseInt(secondsParts[0], 10);
        const milliseconds = parseInt(secondsParts[1], 10);
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }

    updateInfo();
})();
