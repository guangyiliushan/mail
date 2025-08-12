export function initRipple() {
  if (typeof window === "undefined") return;
  const handler = (e: PointerEvent) => {
    const target = (e.target as HTMLElement)?.closest("button, [data-ripple]") as HTMLElement | null;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    ripple.style.setProperty("--ripple-x", `${x}px`);
    ripple.style.setProperty("--ripple-y", `${y}px`);
    ripple.style.setProperty("--ripple-size", `${size}px`);

    target.appendChild(ripple);

    // 清理
    setTimeout(() => {
      ripple.remove();
    }, 650);
  };

  // 委托，避免为每个按钮单独绑定
  document.addEventListener("pointerdown", handler, { passive: true });
}