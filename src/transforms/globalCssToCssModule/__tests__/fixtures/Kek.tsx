import React from 'react'

export const Kek = () => {
    const isActive = true

    return (
        <div className="kek kek--wow d-flex m-1">
            <div
                className={classNames('m-1', true ? 'kek' : false, 'd-flex', {
                    kek: false,
                    'd-flex mr-1 kek': isActive,
                })}
            ></div>
            It's a component<p className="kek--wow">wow</p>
            <div className="m-2 repo-header d-flex m-1">Another one!</div>
        </div>
    )
}
