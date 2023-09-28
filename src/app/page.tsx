"use client";

import { Fragment, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment, Html } from "@react-three/drei";
import gsap from "gsap";
import { motion } from "framer-motion";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Image from "next/image";

export default function CanvasComponent() {
    const [hoverWidth, setHoverWidth] = useState<number>(0);
    const [opacity, setOpacity] = useState<number>(0);
    const [color, setColor] = useState<string>("#0000bb")
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [start, setStart] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerInterval, setTimerInterval] = useState<number | null>(null);

    useEffect(() => {
        let startTime = 0;

        function updateTimer() {
            const interval: any = setInterval(() => {
                const currentTime = Date.now();
                const elapsedTime = new Date(currentTime - startTime);
                const minutes = elapsedTime.getUTCMinutes();
                const seconds = elapsedTime.getUTCSeconds();
                const milliseconds = elapsedTime.getUTCMilliseconds();
                const timer = document.getElementById("timer") as HTMLDivElement;
                if (timer) {
                    timer.innerText = `${minutes}:${seconds}.${milliseconds}`;
                }
            }, 10);
            startTime = Date.now();
            setTimerRunning(true);
            setTimerInterval(interval);
        }
        if (start) {
            updateTimer();
        }

        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [start]);

    const startFunction = () => {
        setStart(true);
    };

    useEffect(() => {
        const handleMouseMove = (event: { clientX: any; clientY: any; }) => {
            setMousePos({ x: event.clientX + 10, y: event.clientY + 20 });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener(
                'mousemove',
                handleMouseMove
            );
        };
    }, []);

    return (
        <Fragment>
            <section className="h-[100dvh] w-[100dvw] flex flex-col justify-center">
                <motion.div
                    className={`w-full h-full flex flex-col justify-center ${start ? 'h-[20dvh]' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >                    <div className="h-[30dvh] w-[100dvw] bg-pink-100 flex flex-row flex-wrap text-xl my-auto bg-opacity-50">
                        <ol className="h-full w-full ml-10 md:ml-20 lg:ml-56">
                            <li className="text-base my-5 underline font-bold md:text-2xl">次の ３ つのタスクを実行してください。</li>
                            <li className="text-base md:text-xl">1. ボタンAを押してください。</li>
                            <li className="text-base md:text-xl">2. 3つのチェックボックスに<span className="font-bold underline">全てチェック</span>を入れてください。</li>
                            <li className="text-base md:text-xl">3. 完了時間を記録してください</li>
                            {start ? (
                                <div>
                                    <div id="timer" className="h-[5dvh] w-[10dvw]" />
                                </div>
                            ) : (
                                <button onClick={startFunction} className="h-[5dvh] w-[10dvw] text-base font-medium text-center bg-white rounded-xl border-2 border-amber-900">ボタンA</button>
                            )}
                        </ol>
                    </div>
                    {start ? <div className="absolute z-10 bottom-20 right-20 h-[20dvh] w-[20dvh] flex flex-col bg-white text-center justify-center"><Image src="/textures/hover.svg" className="h-full w-full p-5" alt={""} width={100} height={100} /></div> : null}
                    <div className="absolute w-20 bg-gray-200 rounded-full h-2.5 z-10" style={{ top: `${mousePos.y}px`, left: `${mousePos.x}px`, transform: "translate(-50%, -50%)", opacity: `${opacity}` }}>
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${hoverWidth}%`, backgroundColor: `${color}` }}></div>
                    </div>
                    <Canvas className="h-[100dvh] w-[100dvw]" camera={{ position: [6, 7, 25], fov: 45 }}>
                        <Environment background preset="city" />
                        <Box setHoverWidth={setHoverWidth} setOpacity={setOpacity} setColor={setColor} timerInterval={timerInterval} timerRunning={timerRunning} start={start} />
                    </Canvas>
                </motion.div>
            </section>
        </Fragment>
    );
}


const Box = ({ setHoverWidth, setOpacity, setColor, timerInterval, timerRunning, start }: { setHoverWidth: React.Dispatch<React.SetStateAction<number>>; setOpacity: React.Dispatch<React.SetStateAction<number>>; setColor: React.Dispatch<React.SetStateAction<string>>; timerInterval: number | null; timerRunning: boolean; start: boolean }) => {
    const [hover, setHover] = useState(false);
    const [move, setMove] = useState(0);
    const [hoverTime, setHoverTime] = useState(0);
    const [unfinished, setFinish] = useState(true)
    const groupRef: any = useRef();
    const cameraModel = useLoader(GLTFLoader as any, "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/zombie-car/model.gltf", (loader) => {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("/draco/");
        loader.setDRACOLoader(dracoLoader);
    });

    function enterFunction(e: any) {

        // ホバー時の時間経過を取得（0〜4秒）
        const time = Math.min(e.object.userData.hoverTime, 4);
        setHoverTime(time);
        setHover(true);
    }

    function leaveFunction() {
        setHoverTime(0);
        setHover(false);
    }

    useFrame((state, delta) => {
        if (start) {

            if (hover && move == 0) {

                setHoverTime((prevTime) => Math.min(prevTime + delta));
                setOpacity(Math.min(100, hoverTime * 10))
                let newWidth = Math.min(100, (hoverTime) * 100);
                setHoverWidth(newWidth);
                if (newWidth == 100) {
                    setMove(1)
                    setColor("#bb0000")
                    newWidth = 0;
                    setHover(false)

                }
            }
            if (hover && move == 1) {

                setHoverTime((prevTime) => Math.min(prevTime + delta));
                setOpacity(Math.min(100, hoverTime * 10))

                let newWidth = Math.min(100, (hoverTime) * 100);
                setHoverWidth(newWidth);
                if (newWidth == 100) {
                    setMove(2)
                    setColor("#00bb00")
                    newWidth = 0;
                    setHover(false)
                }
            }
            if (hover && move == 2) {

                setHoverTime((prevTime) => Math.min(prevTime + delta));
                setOpacity(Math.min(100, hoverTime * 10))

                let newWidth = Math.min(100, (hoverTime) * 100);
                setHoverWidth(newWidth);
                if (newWidth == 100) {
                    setMove(0)
                    setColor("#0000bb")
                    newWidth = 0;
                    setHover(false)
                }
            }
            if (!hover) {
                setHoverWidth(0)
                setOpacity(0)
            }
        }
    });

    useEffect(() => {
        if (move == 1) {
            const timeLine = gsap.timeline();
            timeLine.to(groupRef.current.rotation, { y: Math.PI, duration: 1 });
        }
        if (move == 2) {
            const timeLine = gsap.timeline();
            timeLine.to(groupRef.current.rotation, { x: -Math.PI / 2, duration: 1 });
        }
        if (move == 0) {
            const timeLine = gsap.timeline();
            timeLine.to(groupRef.current.rotation, { x: 0, y: 0, duration: 1 });
        }
    }, [move])

    function checkCompletion() {
        const checkbox1 = document.getElementById("checkbox1") as HTMLInputElement;
        const checkbox2 = document.getElementById("checkbox2") as HTMLInputElement;
        const checkbox3 = document.getElementById("checkbox3") as HTMLInputElement;

        if (checkbox1.checked && checkbox2.checked && checkbox3.checked && timerRunning) {
            if (timerInterval && unfinished) {
                clearInterval(timerInterval);
                alert("お疲れ様でした。経過時間をコピーし、Google Formsに貼り付けてください。");
                setFinish(false)
            }
        }
    }

    return (
        <group ref={groupRef}>
            <group scale={0.5}>
                <mesh
                    userData={{ hoverTime: 0 }} onPointerDown={enterFunction} onPointerUp={leaveFunction} onPointerEnter={enterFunction} onPointerLeave={leaveFunction}
                    geometry={cameraModel.scene.children[0].children[0].geometry}
                    material={cameraModel.scene.children[0].children[0].material}
                />
            </group>

            {start ? (
                <>
                    <Html position={[1, 1, 5]} occlude as="div" wrapperClass="point_0">
                        <div className="h-20 w-40 bg-white flex flex-row items-center rounded-xl border-2 border-amber-900 bg-opacity-75">
                            <input type="checkbox" id="checkbox1" onClick={checkCompletion} className="h-6 w-20" />
                            <p className="h-ful w-20 ml-5 text-base text-start">フロント</p>
                        </div>
                    </Html>
                    <Html position={[1, 2, -5]} occlude as="div" wrapperClass="point_1">
                        <div className="h-20 w-40 bg-white flex flex-row items-center rounded-xl border-2 border-amber-900 bg-opacity-75">
                            <p className="h-ful w-20 mr-5 text-base text-start">リア</p>
                            <input type="checkbox" id="checkbox2" onClick={checkCompletion} className="h-6 w-20" />
                        </div>
                    </Html>
                    <Html position={[0, -2, -1]} occlude as="div" wrapperClass="point_2">
                        <div className="h-20 w-40 bg-white flex flex-row items-center rounded-xl border-2 border-amber-900 bg-opacity-75">
                            <input type="checkbox" id="checkbox3" onClick={checkCompletion} className="h-6 w-20" />
                            <p className="h-ful w-20 ml-5 text-base text-start">ボディ下部</p>
                        </div>
                    </Html>
                </>
            ) : null}
        </group>
    );
};
