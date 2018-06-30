import * as React from 'react'
import { StyledButton } from './styled'

class Counter extends React.Component<{}, { count: number }> {
    public state = { count: 0 }

    public componentDidMount() {
        this.interval = window.setInterval(() => this.setState(prevState => ({ count: prevState.count + 1 })), 200)
    }

    public componentWillUnmount() {
        clearInterval(this.interval)
    }

    private interval: number

    public generateString1() {
        return '1'
    }

    public generateString2 = () => '1'

    public render() {
        return (
            <span>
                <StyledButton red />
                {this.state.count} - {this.generateString1()} - {this.generateString2()}
            </span>
        )
    }
}

export default Counter
