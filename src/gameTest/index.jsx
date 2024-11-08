import * as React from "react";
import "./index.css";

export const GameTest = () => {
  const [numCircles, setNumCircles] = React.useState("");
  const [isReload, setIsReload] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const timerRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [points, setPoints] = React.useState([]);
  const lastClickIndex = React.useRef(0);
  const currentIndex = React.useRef(0);
  const [error, setError] = React.useState(false);
  const [errorField, setErrorField] = React.useState(false);
  const [isWinner, setIsWinner] = React.useState(false);
  const [autoPlay, setAutoPlay] = React.useState(false);
  const autoPlayCountDown = React.useRef(0);
  React.useEffect(() => {
    return () => stopTime();
  }, []);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      drawCircles(context, parseInt(numCircles));
    }

    return () => {};
  }, [points]);

  const playGroundWidth = 650;
  const playGroundHeight = 500;
  const pointRadius = 25;
  const calculateDistance = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };
  const drawCircles = (context, numCircles) => {
    context.clearRect(0, 0, playGroundWidth, playGroundHeight);
    
    let reverser = [...points].reverse();
    reverser.forEach((item, index) => {
      if (item.opacity == 0) {
        return;
      }
      context.beginPath();
      context.arc(item.x, item.y, 25, 0, 2 * Math.PI);

      const color = `rgba(255,99,71,${
        item.opacity != null ? item.opacity : 1
      })`;
      context.fillStyle = item.checked ? color : "white";
      context.fill();
      context.strokeStyle = item.checked ? color : "black";
      context.stroke();

      context.fillStyle = "black";
      context.font = "13px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";

      context.fillText(`${points.length - index}`, item.x, item.y);

      if (item.countdown != null) {
        context.font = "10px Arial";
        context.fillText(`${item.countdown.toFixed(1)}s`, item.x, item.y + 10);
      }
    });
  };

  const stopTime = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  React.useEffect(() => {
    if (points.length != 0 && time != 0 && !error && !isWinner) {
      setPoints(
        points.map((item) => {
          let countdown = item.countdown;
          let opacity = item.opacity;
          if (item.checked == true) {
            if (countdown == null) {
              countdown = 2;
            } else {
              countdown = countdown <= 0 ? 0 : countdown - 0.1;
            }

            if (opacity == null) {
              opacity = 1;
            } else {
              opacity = opacity <= 0 ? 0 : opacity - 0.05;
            }
          }
          return { ...item, countdown, opacity };
        })
      );
      let correctedPoints = points.filter(
        (item) => item.checked == true && item.opacity == 0
      );
      if (correctedPoints && correctedPoints.length == numCircles) {
        setIsWinner(true);
        stopTime();
      }
    }

    return () => {};
  }, [time, error, isWinner, autoPlay]);

  const startTime = () => {
    stopTime();
    timerRef.current = setInterval(() => {
      setTime((time) => time + 0.1);
    }, 100);
  };
  const createPoint = (numCircles) => {
    let points = [];
    while (points.length < numCircles) {
      if (points.length === 0) {
        points.push({
          x: Math.random() * (playGroundWidth - pointRadius),
          y: Math.random() * (playGroundHeight - pointRadius),
          checked: false,
        });
      } else {
        let x = Math.random() * (playGroundWidth - pointRadius);
        let y = Math.random() * (playGroundHeight - pointRadius);
        if (numCircles > 75) {
          points.push({ x, y, checked: false });
        }
        let overlapPoints = points.filter(
          (p) => calculateDistance(x, y, p.x, p.y) <= 2 * 25
        );
        if (overlapPoints.length > 0) {
          continue;
        } else {
          points.push({ x, y, checked: false });
        }
      }
    }
    return points;
  };
  const handleClickPlay = () => {
    setTime(0);
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      const points = createPoint(numCircles);
      setPoints(points);
    }

    if (numCircles) {
      if (numCircles <= 0) {
        setErrorField(true);
        stopTime();
        setTime(0);
      } else {
        setTime(0);
        startTime();
        setIsReload(true);
        setAutoPlay(false);
      }
    }
  };

  const handleClickReload = () => {
    const newPoints = createPoint(numCircles);
    const correctedPoints = points.filter(
      (item) => item.checked === true && item.opacity === 0
    );

    if (isWinner) {
      setNumCircles("");
      setTime(0);
      setPoints([]);
      setIsReload(false);
      setErrorField(false);
      setError(false);
      setIsWinner(false);
      lastClickIndex.current = 0;
      stopTime();

      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      setAutoPlay(false);
      return;
    }
    if (error && isReload) {
      lastClickIndex.current = 0;
      setError(false);
      setTime(0);
      setIsReload(false);
      setPoints(newPoints);
      setAutoPlay(true);
      handleClickPlay();

      return;
    }

    if (lastClickIndex.current !== 0) {
      setPoints(newPoints);
      setIsReload(true);
      lastClickIndex.current = 0;

      if (isReload && autoPlay) {
        setAutoPlay(true);
        setIsReload(true);
      } else {
        setAutoPlay(false);
      }

      if (correctedPoints && correctedPoints.length === numCircles) {
        setIsWinner(true);
        stopTime();
        setNumCircles("");
        setPoints([]);
        setTime(0);
        setIsReload(true);
        setError(false);
        setTime(0);
      }
    } else {
      setNumCircles("");
      setTime(0);
      setPoints([]);
      setIsReload(false);
      stopTime();
      setErrorField(false);
      setError(false);
      setIsWinner(false);
      lastClickIndex.current = 0;

      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleInputChange = (event) => {
    setNumCircles(event.target.value);
    setErrorField(false);
  };
  const clickPoint = (x, y, points) => {
    if (!points) {
      return -1;
    }
    let index = points.findIndex(
      (p) => calculateDistance(p.x, p.y, x, y) <= 25
    );
    return index;
  };

  const handleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  const handleClickPoints = React.useCallback(
    (event) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      let index = clickPoint(clickX, clickY, points);

      if (index !== -1) {
        const updatedPoints = [...points];
        updatedPoints[index] = {
          ...updatedPoints[index],
          checked: true,
          color: 1,
        };
        setPoints(updatedPoints);

        if (index <= lastClickIndex.current) {
          if (points[index].checked == true) {
            return;
          }
          currentIndex.current = index;

          if (currentIndex.current == lastClickIndex.current) {
            lastClickIndex.current = lastClickIndex.current + 1;
          }
        } else {
          stopTime();
          setError(true);
        }
      }
    },
    [points]
  );
  React.useEffect(() => {
    if (autoPlay && time > 0 && points.length > 0) {
      if (
        autoPlayCountDown.current > 0 ||
        currentIndex.current > points.length
      ) {
        autoPlayCountDown.current = autoPlayCountDown.current - 0.05;
        return;
      }
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      let updatedPoint = points[lastClickIndex.current];
      if (!updatedPoint) {
        return;
      }
      const clientX = updatedPoint.x + rect.left;
      const clientY = updatedPoint.y + rect.top;

      handleClickPoints({ clientX, clientY });

      autoPlayCountDown.current = 3;
    }

    return () => {};
  }, [autoPlay, points, time]);

  return (
    <div className="game-container">
      <label
        className={`game-label ${
          error ? "error" : isWinner ? "winner" : "default"
        }`}
      >
        {error ? "GAME OVER" : isWinner ? "ALL CLEARED" : `LET'S PLAY`}
      </label>
      <div className="input-container">
        <span>Points:</span>
        <input
          type="number"
          className={`input-number ${errorField ? "error" : ""}`}
          value={numCircles}
          onChange={handleInputChange}
        />
      </div>
      {errorField && (
        <div className="error-message">Please input a valid integer</div>
      )}
      <div className="time-container">
        <span>Time:</span>
        <span>{time.toFixed(1)}s</span>
      </div>
      <div className="button-group">
        {!isReload ? (
          <button onClick={handleClickPlay}>Play</button>
        ) : (
          <button onClick={handleClickReload}>Restart</button>
        )}
        {time !== 0 && (
          <button onClick={handleAutoPlay}>
            Auto Play {autoPlay ? "Off" : "On"}
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={650}
        height={500}
        className="canvas-style"
        onClick={handleClickPoints}
      ></canvas>
    </div>
  );
};
