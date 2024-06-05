javascript:(function(){
    // Khởi tạo các biến cho thời gian bắt đầu và kết thúc, số lần lặp, và trạng thái lặp
    let startTime = 0;
    let endTime = 0;
    let looping = false;
    let loopCount = 30; // Số lần lặp lại
    let currentLoop = 0;

    // Lấy phần tử video từ trang
    const video = document.querySelector('video');

    // Hàm để lặp lại đoạn video
    function loopVideo() {
        if (looping && video.currentTime >= endTime) {
            video.pause();
            currentLoop++;
            console.log(`Lặp lại lần ${currentLoop} / ${loopCount}`);
            const segmentDuration = endTime - startTime;
            const pauseDuration = segmentDuration * 2 + 1; // Thời gian nghỉ gấp đôi thời gian đoạn video + 1 giây
            if (currentLoop < loopCount) {
                setTimeout(() => {
                    video.currentTime = startTime;
                    video.play();
                }, pauseDuration * 1000);
            } else {
                looping = false;
                console.log("Hoàn thành lặp lại.");
            }
        }
    }

    // Lắng nghe sự kiện cập nhật thời gian video
    video.addEventListener('timeupdate', loopVideo);

    // Hàm để điều chỉnh thời gian bắt đầu và kết thúc
    function adjustTime(type, delta) {
        if (type === "start") {
            startTime = Math.max(0, startTime + delta);
        } else if (type === "end") {
            endTime = Math.max(startTime + 0.1, endTime + delta);
        }
        console.log(`Thời gian bắt đầu: ${startTime.toFixed(2)}s, Thời gian kết thúc: ${endTime.toFixed(2)}s`);
        // Phát lại video từ thời gian bắt đầu mới
        video.currentTime = startTime;
        video.play();
    }

    // Hàm để điều chỉnh tốc độ phát video
    function adjustPlaybackRate(delta) {
        video.playbackRate = Math.max(0.1, video.playbackRate * (1 + delta / 100));
        console.log(`Tốc độ phát: ${video.playbackRate.toFixed(2)}`);
    }

    // Lắng nghe sự kiện nhấn phím để điều khiển phát lại video và lặp lại
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'b':
                startTime = video.currentTime;
                console.log(`Thời gian bắt đầu đặt thành: ${startTime.toFixed(2)}s`);
                break;
            case 'n':
                endTime = Math.max(startTime + 0.1, video.currentTime);
                looping = true;
                currentLoop = 0;
                console.log(`Thời gian kết thúc đặt thành: ${endTime.toFixed(2)}s`);
                break;
            case 'h':
                looping = false;
                console.log("Hủy lặp lại.");
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
                adjustTime("end", 1); // Chỉ điều chỉnh thời gian kết thúc thêm 1 giây
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
                console.log(`Số lần lặp lại: ${loopCount}`);
                break;
            case 'k':
                loopCount++;
                console.log(`Số lần lặp lại: ${loopCount}`);
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

})();
