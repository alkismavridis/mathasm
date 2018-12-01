import React from 'react';


export function nl2br(text) {
    return text.split('\n').map((item, key) => {
        return <span key={key}>{item}<br/></span>
    });
}