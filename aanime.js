javascript:(function(){
    let startTime = 0;
    let endTime = 0;
    let looping = false;
    let loopCount = 30;
    let currentLoop = 0;
    let isPaused = false;

    const video = document.querySelector('video');

    // Tạo phần tử HTML để hiển thị thông số
    const infoDiv = document.createElement('div');
    infoDiv.style.position = 'fixed';
    infoDiv.style.top = '10px';
    infoDiv.style.left = '10px';
    infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    infoDiv.style.color = 'white';
    infoDiv.style.padding = '10px';
    infoDiv.style.borderRadius = '5px';
    infoDiv.style.zIndex = '1000';
    document.body.appendChild(infoDiv);

    function updateInfo() {
        infoDiv.innerHTML = `
            <p>Tốc độ phát: ${video.playbackRate.toFixed(2)}</p>
            <p>Thời gian bắt đầu: ${startTime.toFixed(2)}s</p>
            <p>Thời gian kết thúc: ${endTime.toFixed(2)}s</p>
            <p>Lặp lại lần: ${currentLoop} / ${loopCount}</p>
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
            <p>Nhấn F12 để đóng bảng điều khiển.</p>
        `;
    }

    function loopVideo() {
        if (looping && video.currentTime >= endTime && !isPaused) {
            isPaused = true;
            video.pause();
            currentLoop++;
            updateInfo();  // Cập nhật thông tin
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
        updateInfo();  // Cập nhật thông tin
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
                restartLoop(); // Gọi hàm restartLoop() khi nhấn phím n
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
            default:
                break;
        }
    });

    // Cập nhật thông tin ban đầu
    updateInfo();

    // Xóa bảng điều khiển
    console.clear();
})();
