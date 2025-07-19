import { Ball } from "./game";

//Bu fonksiyon, topun AI paddle'ının X konumuna vardığında hangi Y konumunda olacağını tahmin eder.

export function predictBallY(ball: Ball, paddleX: number, topBound: number): number {
	let x = ball.position.x;
	let y = ball.position.y;
	let vx = ball.velocity.x;
	let vy = ball.velocity.y;


	const bottomBound = -topBound;
	const otherPaddleX = -paddleX;

	while (Math.sign(vx) < 0 && otherPaddleX <= x) //top diğer tarafa gittiği sürece
	{
		const timeToWallY = vy > 0 ? Math.abs((topBound - y) / vy) : Math.abs((bottomBound - y) / vy);

		const timeToOtherPaddleX = Math.abs((otherPaddleX - x) / vx);

		if (timeToOtherPaddleX < timeToWallY) {
			// Top duvara çarpmadan önce diğer pedala ulaşacak
			y += vy * timeToOtherPaddleX;
			x += vx * timeToOtherPaddleX;
			vx *= -1;

			// 🎯 HIZI ARTTIR
			vx *= 1.2;
			vy *= 1.2;


			break;
		} else {
			// Duvara çarpacak, yansıma yap
			x += vx * timeToWallY;
			y += vy * timeToWallY;
			vy *= -1;
		}
	}


	while (Math.sign(vx) > 0 && paddleX >= x) // top sağa doğru (ai pedalına doğru) gidiyor
	{
		const timeToWallY = vy > 0 ? Math.abs((topBound - y) / vy) : Math.abs((bottomBound - y) / vy);

		const timeToPaddleX = Math.abs((paddleX - x) / vx);

		if (timeToPaddleX < timeToWallY) {
			// Top duvara çarpmadan önce pedala ulaşacak
			y += vy * timeToPaddleX;
			break;
		} else {
			// Duvara çarpacak, yansıma yap
			y += vy * timeToWallY;
			vy *= -1;
			x += vx * timeToWallY;
		}
	}

	y = Math.min(y, topBound);
	y = Math.max(y, bottomBound);
	return y;
}