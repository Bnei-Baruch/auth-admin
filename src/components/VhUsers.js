import React, { Component } from 'react';
import {Button, Container, Segment, Popup, Table, Icon, Menu, Dropdown, Input, Message} from "semantic-ui-react";
import DatePicker from "react-datepicker";
import {getAuthData, getVhData} from "../shared/tools";
import {AUTH_API, LOGIN_API, CLIENTS, lang_options, status_options, mem_status_options} from "../shared/env";

class VhUsers extends Component {

    state = {
        filters: {},
        users: [],
        profile_users: [],
        order_users: [],
        selected_user: "",
        selected_client: "",
        search: "email",
        disabled: true,
        loading: true,
        input: "",
        first: 0,
        max: 15,
        user_info: {},
        status_from_order: {},
        counts: CLIENTS,
        total: 0,
        language: "",
        date: null,
        membership_type: ""
    };

    componentDidMount() {
       this.getData(0, 17)
        getVhData(`pay/payments/activities`, (order_users) => {
            console.log(order_users)
            this.setState({order_users});
        });
    };

    getData = (first, max) => {
        const {filters} = this.state;
        let empty = Object.keys(filters).length === 0
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = empty ? `profile/v1/profiles?skip=${first}&limit=${max}` : `profile/v1/profiles?skip=${first}&limit=${max}&`+ query.join('&');
        getVhData(path, (profile_users) => {
            this.setState({profile_users, loading: false, input: ""});
            console.log(profile_users)
        });
    };

    setLangFilter = (language) => {
        const {filters} = this.state;
        if(!language) {
            delete filters["language"];
            this.setState({filters, language: ""}, () => {
                this.getData(0, 17);
            });
            return
        }
        filters.language = language
        this.setState({filters, language}, () => {
            this.getData(0, 17);
        });
    };

    setDateFilter = (date) => {
        const {filters} = this.state;
        if(!date) {
            delete filters["date"];
            this.setState({filters, date: ""}, () => {
                this.getData(0, 17);
            });
            return
        }
        filters.date = date.toLocaleDateString('sv');
        this.setState({filters, date}, () => {
            this.getData(0, 17);
        });
    };

    setStatusFilter = (membership_type)=> {
        const {filters} = this.state;
        if(!membership_type) {
            delete filters["membership-type"];
            this.setState({filters, membership_type: ""}, () => {
                this.getData(0, 17);
            });
            return
        }
        filters["membership-type"] = membership_type
        this.setState({filters, membership_type}, () => {
            this.getData(0, 17);
        });
    };

    getForward = () => {
        let {first, max} = this.state;
        first = first + 15
        this.getData(first, max);
        this.setState({first});
    }

    getReverce = () => {
        let {first, max} = this.state;
        first = first - 15
        if(first < 0) first = 0;
        this.getData(first, max);
        this.setState({first});
    }

    setClient = (k) => {
        getAuthData(`${LOGIN_API}/keycloak/logins/${k}`, (users) => {
            this.setState({users, selected_client: k});
        });
    }

    selectUser = (id, user) => {
        console.log(user)
        getVhData(`pay/payments/all/${user.primary_email}`, (user) => {
            console.log(user)
        });
        getVhData(`pay/status/${user.primary_email}`, (status_from_order) => {
            this.setState({status_from_order})
            console.log(status_from_order)
        });
        // const {search, input, users} = this.state;
        // getAuthData(`${AUTH_API}/find?id=${id}`, (response) => {
        //     getAuthData(`${AUTH_API}/user/${id}`, (user_info) => {
        //         let user = {...response,...user_info}
        //         this.setState({selected_user: id, user_info: user});
        //         console.log(user)
        //     });
        // });
    }

    setRequest = () => {
        const {input} = this.state;
        console.log(input);
    }

    render() {
        const {profile_users, loading, selected_user, status_from_order, language, date,membership_type} = this.state;

        let v = (<Icon color='green' name='checkmark'/>);
        let x = (<Icon color='red' name='close'/>);

        const options = [
            { key: 'email', text: 'Mail', value: 'email' },
            { key: 'id', text: 'UserID', value: 'user_id' },
        ]

        let users_content = profile_users.map(user => {
            const {keycloak_id,first_name_latin,last_name_latin,country,city,first_language,primary_email,created_at,study_start_year,status} = user;
            const {membership,membership_type,ticket,convention,galaxy} = status
            //const created_at = new Date(time).toUTCString();
            return (<Popup trigger={<Table.Row key={keycloak_id}
                                               active={keycloak_id === selected_user}
                                               onClick={() => this.selectUser(keycloak_id, user)} >
                    <Table.Cell>{first_name_latin}</Table.Cell>
                    <Table.Cell>{last_name_latin}</Table.Cell>
                    <Table.Cell>{keycloak_id}</Table.Cell>
                    <Table.Cell>{primary_email}</Table.Cell>
                    <Table.Cell>{study_start_year}</Table.Cell>
                    <Table.Cell>{country}</Table.Cell>
                    <Table.Cell>{city}</Table.Cell>
                    <Table.Cell>{first_language}</Table.Cell>
                    <Table.Cell>{created_at}</Table.Cell>
                    <Table.Cell>{membership_type}</Table.Cell>
                </Table.Row>} flowing hoverable on='click'>
                <Table compact='very' structured unstackable singleLine celled>
                    <Table.Row>
                        <Table.Cell width={3}>Special</Table.Cell>
                        <Table.Cell textAlign='center'>{status_from_order.is_special ? v : x}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>Membership</Table.Cell>
                        <Table.Cell textAlign='center'>{status_from_order.membership ? v : x}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>Status</Table.Cell>
                        <Table.Cell textAlign='center'>{status_from_order.status_name}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>Ticket</Table.Cell>
                        <Table.Cell textAlign='center'>{status_from_order.ticket ? v : x}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={2}>Color</Table.Cell>
                        <Table.Cell textAlign='center'>{status_from_order.status_color}</Table.Cell>
                    </Table.Row>
                </Table>
            </Popup>
            )
        });

        return (
            <Container fluid>
                <Message size='large'>
                <Menu size='large' secondary>
                    <Menu.Item>
                        <Dropdown
                            placeholder="Language:"
                            selection
                            clearable
                            options={lang_options}
                            language={language}
                            onChange={(e, {value}) => this.setLangFilter(value)}
                            value={language}>
                        </Dropdown>
                        <DatePicker disabled
                            // locale={locale}
                            customInput={<Input icon={
                                <Icon name={date ? 'close' : 'dropdown'} link onClick={() => this.removeFilter("date")} />
                            }/>}
                            dateFormat="yyyy-MM-dd"
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            maxDate={new Date()}
                            openToDate={new Date()}
                            selected={date ? date : null}
                            placeholderText="Date:"
                            onChange={this.setDateFilter}
                        />
                    </Menu.Item>
                    <Menu.Menu>

                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Dropdown
                                placeholder="Status:"
                                selection
                                clearable
                                options={mem_status_options}
                                onChange={(e, {value}) => this.setStatusFilter(value)}
                                value={membership_type}>
                            </Dropdown>
                        </Menu.Item>
                        <Menu.Item>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                </Message>
                <Button.Group attached='top'>
                    {/*{buttons}*/}
                </Button.Group>
                <Segment attached textAlign='center' className="group_list" raised loading={loading} >
                    <Table selectable compact='very' basic structured className="admin_table" unstackable fixed>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={2}>First Name</Table.Cell>
                                <Table.Cell width={2}>Last Name</Table.Cell>
                                <Table.Cell width={4}>User ID</Table.Cell>
                                <Table.Cell width={4}>EMail</Table.Cell>
                                <Table.Cell width={1}>Study</Table.Cell>
                                <Table.Cell width={1}>Country</Table.Cell>
                                <Table.Cell width={2}>City</Table.Cell>
                                <Table.Cell width={1}>Language</Table.Cell>
                                <Table.Cell width={4}>Created</Table.Cell>
                                <Table.Cell width={1}>Status</Table.Cell>
                            </Table.Row>
                            {users_content}
                        </Table.Body>
                    </Table>
                </Segment>
                <Button.Group attached='bottom' >
                    <Button icon onClick={this.getReverce} ><Icon name='angle double left' /></Button>
                    <Button icon onClick={this.getForward} ><Icon name='angle double right' /></Button>
                </Button.Group>
            </Container>
        );
    }
}

export default VhUsers;
