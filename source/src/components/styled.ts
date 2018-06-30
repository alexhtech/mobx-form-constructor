import styled from 'styled-components'

export interface IStyledButton {
    red?: boolean
}

const StyledButton = styled<IStyledButton, any>('button')`
    background-color: blue;
    padding: 10px;
    ${({ red }: IStyledButton) =>
        red &&
        `
    background-color: red;
    `};
`

export { StyledButton }
