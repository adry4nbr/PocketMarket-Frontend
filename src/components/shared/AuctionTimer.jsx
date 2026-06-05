import { useEffect, useState } from "react";

export default function AuctionTimer({ endsAt }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = new Date(endsAt) - new Date();

            if (diff <= 0) {
                setTimeLeft("Ended");
                clearInterval(interval);
                return;
            }

            const hours = Math.floor(diff / 1000 / 60 / 60);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(
                `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds
                    .toString()
                    .padStart(2, "0")}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [endsAt]);

    return <span>⏰ {timeLeft}</span>;
}