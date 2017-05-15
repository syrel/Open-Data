/**
 * Created by syrel on 15.05.17.
 */

import React from 'react';
import { Button } from 'react-bootstrap';

class LoadingButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false
        };

        this.callback = props.callback;
    }

    render() {
        let isLoading = this.state.isLoading;
        return (
            <Button
                bsStyle="primary"
                disabled={isLoading}
                onClick={!isLoading ? this.handleClick.bind(this) : null}>
                Query
            </Button>
        );
    }

    handleClick() {
        this.setState({isLoading: true});
        this.callback(() => this.setState({isLoading: false}));
    }
}

export default LoadingButton;