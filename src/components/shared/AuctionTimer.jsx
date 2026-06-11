import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

export default function AuctionTimer({ endsAt }) {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = new Date(endsAt) - new Date();

            if (diff <= 0) {
                setTimeLeft(t("common.ended"));
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
    }, [endsAt, t]);

    return (
        <span role="timer" aria-live="polite" aria-label={t("accessibility.timer", { time: timeLeft })}>
            ⏰ {timeLeft}
        </span>
    );
}
