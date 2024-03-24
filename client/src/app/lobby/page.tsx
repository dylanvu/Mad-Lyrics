"use client";
import { useEffect, useContext } from "react";

import { WebsocketContext } from "@/components/socket";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Lobby() {
    const ws = useContext(WebsocketContext);
    const router = useRouter();

    const handleStart = () => {
        router.push("/"); // FIXME: When we swap URLs, make sure to update this too

        // TODO: Send start event to all clients
    };

    useEffect(() => {
        console.log(ws.valueQueue);
    }, [ws.valueQueue]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="main-div">lobby</div>

            <Button onClick={handleStart}>Start Game</Button>
            <p>{ws.ready ? "Connected!" : "Not connected )="}</p>
        </main>
    );
}
