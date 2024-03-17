'use client'

import React, {useEffect, useState, useCallback, Suspense} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useEntryStore } from '../../hooks/useEntryStore';

import { reference_image, instructions } from '../../config/event';
import styles from '../../styles/editor.module.scss';
import { useRouter } from 'next/navigation';
import { Modal } from "../modal/Modal";
import { Streak } from "../streak/Streak";
import { Button } from "../button/Button";
import { Editor } from "./Editor";
import Image from "next/image";

const STREAK_TIMEOUT = 10 * 1000;

const POWER_MODE_ACTIVATION_THRESHOLD = 200;

function Loading() {
    return <h2>🌀 Loading...</h2>;
}

export const EditorView = () => {
    const { entry, updateHtml, isSubmitted, updateIsSubmitted, updateIsLoading } =
        useEntryStore();
    const [streak, setStreak] = useState(0);
    const [powerMode, setPowerMode] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showReference, setShowReference] = useState(false);
    const router = useRouter();

    const debouncedSearchTermChanged = useDebouncedCallback(() => {
        setStreak(0);
        setPowerMode(false);
    }, STREAK_TIMEOUT);

    const onChange = useCallback(
        (newValue: string) => {
            setStreak(streak + 1);
            if (streak === POWER_MODE_ACTIVATION_THRESHOLD) {
                setPowerMode(true);
            }
            debouncedSearchTermChanged();
            updateHtml(newValue);
        },
        [streak, debouncedSearchTermChanged, updateHtml]
    );

    // useInterval(async () => {
    // TODO : Send code to DB to display it
    // }, 15000);

    useEffect(() => {
        if (isSubmitted) router.push('/thanks');
    }, [isSubmitted, router]);

    const finishHandler = useCallback(async () => {
        updateIsLoading(true);

        // TODO : Push code in DB to validate it

        updateIsSubmitted(true);
        updateIsLoading(false);
        router.push('/thanks');
    }, [updateIsLoading, updateIsSubmitted, router]);

    return (
        <div
            className={`${styles.editorView} ${powerMode && styles.powerModeOuter}`}
        >
            <Modal show={showInstructions} setShow={setShowInstructions}>
                <pre>{instructions}</pre>
            </Modal>
            <Modal show={showReference} setShow={setShowReference}>
                <Image
                    src={reference_image}
                    className={styles.referenceImage}
                    alt='Image de référence'
                />
            </Modal>
            <Streak streak={streak} powerMode={powerMode} />
            <div
                className={powerMode ? styles.backgroundPowerMode : styles.background}
            />

            <Suspense fallback={<Loading />}>
                <Editor
                    onChange={onChange}
                    className={styles.editor}
                    defaultValue={entry?.html || ''}
                />
            </Suspense>

            <div className={styles.editorViewNametag}>{entry?.fullName || ''}</div>

            <div className={styles.editorViewControls}>
                <div className={styles.editorViewReference}>
                    Reference
                    <div
                        onClick={() => setShowReference(true)}
                        className={styles.editorViewReferenceImage}
                        style={{ backgroundImage: `url(${reference_image})` }}
                    />
                </div>

                <div className={styles.editorViewButtons}>
                    <Button
                        onClick={() => setShowInstructions(true)}
                        className={`${styles.editorViewButton} ${styles.editorViewButtonsInstructions}`}
                    >
                        Instructions 📖
                    </Button>
                    <Button
                        className={`${styles.editorViewButton} ${styles.editorViewButtonsFinish}`}
                        onClick={finishHandler}
                    >
                        Finish 🏁
                    </Button>
                </div>
            </div>
        </div>
    );
}