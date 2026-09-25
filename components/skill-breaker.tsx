"use client";

import { skillGroups } from "@/lib/data";
import { useCallback, useEffect, useRef, useState } from "react";

type Status = "ready" | "playing" | "won" | "lost";
type Brick = { label: string; row: number; col: number; alive: boolean };

const COLS = 5;
const ROWS = 3;
const HEIGHT = 340;
const PAD = 14;
const GAP = 8;
const BRICK_H = 28;
const BRICK_TOP = 20;
const BALL_R = 7;
const SPEED = 380;
const ROW_COLORS = ["#599fc0", "#8b7cf6", "#34d399"];

const makeBricks = (): Brick[] =>
  skillGroups
    .flatMap((group) => group.skills)
    .slice(0, COLS * ROWS)
    .map((label, i) => ({
      label,
      row: Math.floor(i / COLS),
      col: i % COLS,
      alive: true,
    }));

const SkillBreaker = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const game = useRef({
    bricks: makeBricks(),
    ball: { x: 0, y: 0, vx: 0, vy: 0 },
    paddle: 0.5,
    width: 600,
    keys: { left: false, right: false },
    status: "ready" as Status,
    lives: 3,
  });

  const setGameStatus = useCallback((next: Status) => {
    game.current.status = next;
    setStatus(next);
  }, []);

  const launch = useCallback(() => {
    const g = game.current;
    if (g.status === "won" || g.status === "lost") {
      g.bricks = makeBricks();
      g.lives = 3;
      setLives(3);
      setScore(0);
    }
    if (g.status !== "playing") {
      const angle = (Math.random() - 0.5) * 0.8;
      g.ball.vx = SPEED * Math.sin(angle);
      g.ball.vy = -SPEED * Math.cos(angle);
      setGameStatus("playing");
    }
  }, [setGameStatus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const g = game.current;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      g.width = canvas.clientWidth;
      canvas.width = g.width * dpr;
      canvas.height = HEIGHT * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const brickRect = (b: Brick) => {
      const w = (g.width - PAD * 2 - GAP * (COLS - 1)) / COLS;
      return {
        x: PAD + b.col * (w + GAP),
        y: BRICK_TOP + b.row * (BRICK_H + GAP),
        w,
        h: BRICK_H,
      };
    };
    const paddleW = () => Math.min(120, g.width * 0.24);
    const paddleY = HEIGHT - 26;

    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      const pw = paddleW();
      const half = pw / 2 / g.width;

      if (g.keys.left) g.paddle -= 1.4 * dt;
      if (g.keys.right) g.paddle += 1.4 * dt;
      g.paddle = Math.min(1 - half, Math.max(half, g.paddle));
      const paddleX = g.paddle * g.width;

      const ball = g.ball;
      if (g.status !== "playing") {
        ball.x = paddleX;
        ball.y = paddleY - BALL_R - 1;
      } else {
        const prevX = ball.x;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.x < BALL_R || ball.x > g.width - BALL_R) {
          ball.vx *= -1;
          ball.x = Math.min(g.width - BALL_R, Math.max(BALL_R, ball.x));
        }
        if (ball.y < BALL_R) {
          ball.vy = Math.abs(ball.vy);
        }

        if (
          ball.vy > 0 &&
          ball.y + BALL_R >= paddleY &&
          ball.y < paddleY + 10 &&
          Math.abs(ball.x - paddleX) <= pw / 2 + BALL_R
        ) {
          const offset = (ball.x - paddleX) / (pw / 2);
          const angle = Math.max(-1, Math.min(1, offset)) * (Math.PI / 3);
          ball.vx = SPEED * Math.sin(angle);
          ball.vy = -SPEED * Math.cos(angle);
        }

        for (const brick of g.bricks) {
          if (!brick.alive) continue;
          const r = brickRect(brick);
          const nearX = Math.max(r.x, Math.min(ball.x, r.x + r.w));
          const nearY = Math.max(r.y, Math.min(ball.y, r.y + r.h));
          if ((ball.x - nearX) ** 2 + (ball.y - nearY) ** 2 > BALL_R ** 2) {
            continue;
          }
          brick.alive = false;
          if (prevX < r.x || prevX > r.x + r.w) ball.vx *= -1;
          else ball.vy *= -1;
          setScore((s) => s + 100);
          if (g.bricks.every((b) => !b.alive)) setGameStatus("won");
          break;
        }

        if (ball.y > HEIGHT + BALL_R) {
          g.lives -= 1;
          setLives(g.lives);
          setGameStatus(g.lives > 0 ? "ready" : "lost");
        }
      }

      ctx.clearRect(0, 0, g.width, HEIGHT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${g.width < 480 ? 9 : 11}px ui-monospace, monospace`;
      for (const brick of g.bricks) {
        if (!brick.alive) continue;
        const r = brickRect(brick);
        ctx.fillStyle = ROW_COLORS[brick.row];
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 6);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillText(brick.label, r.x + r.w / 2, r.y + r.h / 2, r.w - 6);
      }

      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.roundRect(paddleX - pw / 2, paddleY, pw, 10, 5);
      ctx.fill();

      ctx.shadowColor = "#599fc0";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [setGameStatus]);

  const onKey = (e: React.KeyboardEvent, down: boolean) => {
    const keys = game.current.keys;
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = down;
    else if (e.key === "ArrowRight" || e.key === "d") keys.right = down;
    else if (down && (e.key === " " || e.key === "Enter")) launch();
    else return;
    e.preventDefault();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-[#0b1620] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-xs">
        <span className="text-white/60">SKILL BREAKER</span>
        <span>
          SCORE <span className="text-[#599fc0]">{String(score).padStart(4, "0")}</span>
        </span>
        <span aria-label={`${lives} lives left`}>
          {"♥".repeat(lives)}
          <span className="text-white/20">{"♥".repeat(3 - lives)}</span>
        </span>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Skill Breaker mini game. Move with the mouse or arrow keys, press space to launch."
          style={{ height: HEIGHT }}
          className="block w-full cursor-none touch-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#599fc0]"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            game.current.paddle = (e.clientX - rect.left) / rect.width;
          }}
          onPointerDown={launch}
          onKeyDown={(e) => onKey(e, true)}
          onKeyUp={(e) => onKey(e, false)}
        />
        {status !== "playing" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-16 text-center font-mono text-sm">
            {status === "ready" && (
              <p className="animate-pulse text-white/80">
                {lives === 3 ? "Click or press space to launch" : "Ball lost. Launch again"}
              </p>
            )}
            {status === "won" && (
              <p className="text-emerald-300">
                You broke every skill. Don&apos;t worry, I still have them.
                <span className="mt-1 block text-white/60">Click to play again</span>
              </p>
            )}
            {status === "lost" && (
              <p className="text-red-400">
                GAME OVER · {score} pts
                <span className="mt-1 block text-white/60">Click to try again</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillBreaker;
