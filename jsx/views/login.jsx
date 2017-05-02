import * as React from 'react';
import * as electron from "electron";
const {remote} = electron;
import HTTPdigest from "request-digest";

import * as wowza from "../../wowza.json";
import {Paper, RaisedButton, TextField, Checkbox} from 'material-ui';
import {NotificationContainer, NotificationManager} from 'react-notifications';

import * as COLOR from "../../jsx/color.json";


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            appName: "",
            errorPassword: "",
            errorUsername: "",
            errorApplication: "",
            save: false,
            _disableNotifications: false
        };
        //50 Shades of bindings
        this.login = this.login.bind(this);

    }

    login() {
        let that = this;
        //TODO test the connection details before logging in
        let digestRequest = HTTPdigest(this.state.username, this.state.password);

        digestRequest.request({
            host: wowza.host,
            path: '/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications',
            port: wowza.port,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }, function (error, response, body) {
            if (error) {
                console.log("Login request error /");
                console.log(error);
                if (error.statusCode == 401) {
                    if (!that._disableNotifications) {
                        that._disableNotifications = true;
                        let timeout = setTimeout(() => {
                            that._disableNotifications = false
                        }, 3000);
                        NotificationManager.error("Invalid Credentials", "", 3000, () => {
                            clearTimeout(timeout);
                            that._disableNotifications = false
                        });
                    }
                    /*that.setState({
                        errorPassword: "Error",
                        errorUsername: "Error",
                        errorApplication: ""
                    });*/
                }
            } else {
                try {
                    let validAppName = false;
                    let jsonResp = JSON.parse(body);
                    for (let value of jsonResp.applications) {
                        if (value.appType === "Live" && value.id === that.state.appName) {
                            validAppName = true;
                        }
                    }
                    if (!validAppName) {
                        if (!that._disableNotifications) {
                            that._disableNotifications = true;
                            let timeout = setTimeout(() => {
                                that._disableNotifications = false
                            }, 3000);
                            NotificationManager.error("Invalid Application", "", 3000, () => {
                                clearTimeout(timeout);
                                that._disableNotifications = false
                            });
                        }
                        /*that.setState({
                            errorPassword: "",
                            errorUsername: "",
                            errorApplication: "Error"
                        });*/
                    } else {
                        //TODO forward user to application and save login conf encoded in case of checkbox
                        //TODO node-keytar for ciphering - requires ????
                        //Problems with keytar
                        that.setState({
                            errorPassword: "",
                            errorUsername: "",
                            errorApplication: ""
                        });
                        if (that.state.save) {
                            console.log("save");
                        }
                        that.props.changeStateTo("monitoring", that.state);
                        console.log("Success!");
                    }
                } catch (e) {
                    console.log("Login parse error /");
                    console.log(e);
                }
            }
        });
    }

    render() {
        let defaultStyle = {
            padding: 10,
            width: 532,
            height: 200,
            top: "calc(50% - 100px)",
            left: "calc(50% - 266px)",
            position: "fixed",
            textAlign: 'left',
            backgroundColor: COLOR.drawerBackground
        };
        return (

            <Paper style={this.props.style || defaultStyle} zDepth={this.props.depth || 5}>
                <TextField
                    onChange={(e) => {
                        this.setState({username: e.target.value});
                    }}
                    floatingLabelText="Username"
                    errorText={this.state.errorUsername}
                    floatingLabelStyle={{
                        color: COLOR.itemHoverColor
                    }}
                />
                <TextField
                    onChange={(e) => {
                        this.setState({password: e.target.value});
                    }}
                    floatingLabelText="Password"
                    floatingLabelStyle={{
                        color: COLOR.itemHoverColor
                    }}
                    errorText={this.state.errorPassword}
                    type="password"
                /><br/>
                <div style={{width: "50%", display: "inline-block", textAlign: "left"}}>
                    <TextField
                        onChange={(e) => {
                            this.setState({appName: e.target.value});
                        }}
                        floatingLabelText="Application"
                        errorText={this.state.errorApplication}
                        floatingLabelStyle={{
                            color: COLOR.itemHoverColor
                        }}

                    />
                    <Checkbox
                        label="Save login credentials"
                        labelStyle={{color: COLOR.itemHoverColor}}
                        iconStyle={{fill: COLOR.itemHoverColor}}
                        style={{checkedColor: COLOR.exitButton}}
                        onCheck={(e) => {
                            this.setState({save: !this.state.save});
                        }}
                    />
                </div>
                <div style={{
                    width: "50%",
                    display: "inline-block"
                }}>
                    <div style={{

                        width: "100%"

                    }}>
                        <NotificationContainer />
                    </div>
                    <div style={{
                        width: "50%",
                        display: "inline-block",
                        textAlign: "center",
                        bottom: 0,
                        position: "absolute"
                    }}>
                        <RaisedButton
                            label="Login"
                            backgroundColor={COLOR.itemHoverColor}
                            onClick={this.login}
                            style={{margin: 10, marginBottom: 20}}
                        />
                        <RaisedButton
                            label="Exit"
                            backgroundColor={COLOR.exitButton}
                            onClick={(e) => {
                                remote.getCurrentWindow().close();
                            }}
                            style={{margin: 10, marginBottom: 20}}
                        />
                    </div>
                </div>

            </Paper>

        );
    }
}
module.exports = Login;