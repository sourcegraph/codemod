import React from 'react'

const Button: React.FunctionComponent<any> = props => {
    return <div>div {'key' in props}</div>
}

// A dummy React application to play with linter plugins created in this repo.
export const Test: React.FunctionComponent = () => {
    return (
        <div>
            <Button variant="primary" className="d-flex" />
            <button type="button" className="random">
                Press me
            </button>
            <button type="button" />
            <Button extraClassName="d-flex btn-primary" className="btn d-flex">
                Hello there!
            </Button>
            <div data-testid="btn">E2E element</div>
        </div>
    )
}
