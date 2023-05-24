import React, { useEffect, useState } from 'react';
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { resizeDirections, resizeEvents } from '../../constants';

const CustomDurationResize = (props) => {
    const [resizeElement, setResizeElement] = useState();

    const resizeArea = document.querySelector(`#wo-${props.dispatchRequestWorkOrderId}`);
    var startX, startWidth, startLeft, itemWidthLeftDirection, itemWidthRightDirection;

    useEffect(() => {
        if (resizeArea) {
            setResizeElement(resizeArea);
        }
    }, [resizeArea])

    const getResizeElement = () => {
        if (!resizeElement) {
            return document.querySelector(`#wo-${props.dispatchRequestWorkOrderId}`);
        }
        return resizeElement;
    }

    const removeEventListener = (event, listener) => {
        document.documentElement.removeEventListener(event, listener, false);
    }

    const addEventListener = (event, listener) => {
        document.documentElement.addEventListener(event, listener, false);
    }

    const doRightDrag = (e) => {
        const resizeArea = getResizeElement();
        itemWidthRightDirection = startWidth + e.clientX - startX;
        if (itemWidthRightDirection > 0) {
            resizeArea.style.width = `${(startWidth + e.clientX - startX)}px`;
        }
        resizeArea.style.opacity = '0.7';
    }

    const doLeftDrag = (e) => {
        const resizeArea = getResizeElement();
        itemWidthLeftDirection = startWidth + startX - e.clientX;
        if (itemWidthLeftDirection > 0) {
            resizeArea.style.width = `${itemWidthLeftDirection}px`;
            resizeArea.style.left = `${(startLeft - (startX - e.clientX))}px`;
        }
        resizeArea.style.opacity = '0.7';
        resizeArea.style.filter = 'contrast(3)';
    }

    const stopLeftDrag = (_e) => {
        const resizeArea = getResizeElement();
        resizeArea.style.opacity = '1';
        resizeArea.style.filter = 'contrast(1)';
        resizeArea.style.width = `${startWidth}px`;
        resizeArea.style.left = `${startLeft}px`;

        removeEventListener(resizeEvents.MOUSE_UP, stopLeftDrag);
        removeEventListener(resizeEvents.MOUSE_MOVE, doLeftDrag);
        removeEventListener(resizeEvents.MOUSE_DOWN, initLeftDrag);

        unsubscribeOnLeftResizeEvent();

        props.handleResizeStop(itemWidthLeftDirection, resizeDirections.LEFT);
    }

    const stopRightDrag = (_e) => {
        const resizeArea = getResizeElement();
        resizeArea.style.opacity = '1';
        resizeArea.style.filter = 'contrast(1)';

        removeEventListener(resizeEvents.MOUSE_MOVE, doRightDrag);
        removeEventListener(resizeEvents.MOUSE_UP, stopRightDrag);
        removeEventListener(resizeEvents.MOUSE_DOWN, initRightDrag);

        unsubscribeOnRightResizeEvent();

        props.handleResizeStop(itemWidthRightDirection, resizeDirections.RIGHT);
    }

    const initRightDrag = (e) => {
        const resizeArea = getResizeElement();
        startX = e.clientX;
        startWidth = parseInt(document.defaultView.getComputedStyle(resizeArea).width, 10);
        addEventListener(resizeEvents.MOUSE_MOVE, doRightDrag);
        addEventListener(resizeEvents.MOUSE_UP, stopRightDrag);
    }

    const initLeftDrag = (e) => {
        const resizeArea = getResizeElement();
        startX = e.clientX;
        startWidth = parseInt(document.defaultView.getComputedStyle(resizeArea).width, 10);
        startLeft = Math.abs(parseInt(document.defaultView.getComputedStyle(resizeArea).left, 10));
        addEventListener(resizeEvents.MOUSE_MOVE, doLeftDrag);
        addEventListener(resizeEvents.MOUSE_UP, stopLeftDrag);
    }

    const subscribeOnLeftResizeEvent = () => {
        const leftResizeBadge = document.querySelector(`#wo-${props.dispatchRequestWorkOrderId} .left-resize`);
        leftResizeBadge.addEventListener(resizeEvents.MOUSE_DOWN, initLeftDrag, false);
    }

    const subscribeOnRightResizeEvent = () => {
        const rightResizeBadge = document.querySelector(`#wo-${props.dispatchRequestWorkOrderId} .right-resize`);
        rightResizeBadge.addEventListener(resizeEvents.MOUSE_DOWN, initRightDrag, false);
    }

    const unsubscribeOnLeftResizeEvent = () => {
        const leftResizeBadge = document.querySelector(`#wo-${props.dispatchRequestWorkOrderId} .left-resize`);
        leftResizeBadge.removeEventListener(resizeEvents.MOUSE_DOWN, initLeftDrag, false);
    }

    const unsubscribeOnRightResizeEvent = () => {
        const rightResizeBadge = document.querySelector(`#wo-${props.dispatchRequestWorkOrderId} .right-resize`);
        rightResizeBadge.removeEventListener(resizeEvents.MOUSE_DOWN, initLeftDrag, false);
    }

    return (
        <div id={`wo-${props.dispatchRequestWorkOrderId}`} className="resize-icons-wrapper" style={props.style}>
            <CaretLeftOutlined className="left-resize" onMouseDownCapture={subscribeOnLeftResizeEvent} onMouseUpCapture={unsubscribeOnLeftResizeEvent} style={{ marginLeft: '-15px' }} />
            <CaretRightOutlined className="right-resize" onMouseDownCapture={subscribeOnRightResizeEvent} onMouseUpCapture={unsubscribeOnRightResizeEvent} style={{ marginRight: '-15px' }} />
        </div>
    )
}

export default CustomDurationResize;