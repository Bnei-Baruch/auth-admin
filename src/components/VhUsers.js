import React, { Component } from 'react';
import {
    Button,
    Container,
    Segment,
    Popup,
    Table,
    Icon,
    Menu,
    Dropdown,
    Input,
    Message,
    Select
} from "semantic-ui-react";
import DatePicker from "react-datepicker";
import {getAuthData, getVhData} from "../shared/tools";
import {AUTH_API, LOGIN_API, CLIENTS, lang_options, mem_status_options} from "../shared/env";
import VhEdit from "./VhEdit";

class VhUsers extends Component {

    state = {
        filters: {},
        users: [],
        profile_users: [],
        order_users: [],
        payments: [],
        selected_user: "",
        selected_client: "",
        search: "email",
        disabled: true,
        loading: true,
        input: "",
        first: 0,
        max: 20,
        user_info: {},
        status_from_order: {},
        counts: CLIENTS,
        total: 0,
        language: "",
        date: null,
        membership_type: "",
        open_edit: false,
    };

    componentDidMount() {
       this.getData(0, 17)
        getVhData(`pay/payments/activities`, (order_users) => {
            console.log("ACTIVITIES", order_users)
            this.setState({order_users});
        });
    };

    getData = (first) => {
        const {filters, max} = this.state;
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
        getVhData(`pay/payments/all/${user.primary_email}`, (payments) => {
            this.setState({payments})
            console.log("PAYMENTS", payments)
        });
        getVhData(`pay/v2/orders?email=${user.primary_email}`, (orders) => {
            this.setState({orders})
            console.log("ORDERS", orders)
        });
        getVhData(`pay/status/${user.primary_email}`, (status_from_order) => {
            this.setState({status_from_order})
            console.log(status_from_order)
        });
        const {search, input, users} = this.state;
        getAuthData(`${AUTH_API}/find?id=${id}`, (response) => {
            getAuthData(`${AUTH_API}/user/${id}`, (user_info) => {
                let kc_user = {...response,...user_info}
                this.setState({selected_user: user, user_info: kc_user, open_edit: true});
                console.log(kc_user)
            });
        });
    }

    clearSelection = () => {
        this.setState({selected_user: "", open_edit: false})
    }

    setRequest = () => {
        const {input} = this.state;
        console.log(input);
    }

    searchUser = () => {
        this.setState({loading: true});
        const {search, input, users} = this.state;
        //let path = empty ? `profile/v1/profiles?skip=${first}&limit=${max}` : `profile/v1/profiles?skip=${first}&limit=${max}&`+ query.join('&');
        getVhData(`profile/v1/profiles?${search}=${input}`, (profile_users) => {
            this.setState({profile_users, loading: false, input: ""});
            console.log(profile_users)
        });
        // getAuthData(`${AUTH_API}/find?${search}=${input}`, (response) => {
        //     users.push(response)
        //     console.log(response)
        //     this.setState({input: ""});
        // });
    };

    render() {
        const {profile_users, loading, selected_user, max, language, date,membership_type, input, search} = this.state;

        let v = (<Icon color='green' name='checkmark'/>);
        let x = (<Icon color='red' name='close'/>);

        const options = [
            { key: 'email', text: 'Mail', value: 'email' },
            { key: 'name', text: 'Name', value: 'name' },
        ]

        const max_options = [
            { key: 'l1', text: '10', value: 10 },
            { key: 'l2', text: '20', value: 20 },
            { key: 'l3', text: '50', value: 50 },
            { key: 'l4', text: '100', value: 100 },
            { key: 'l5', text: '500', value: 500 },
            { key: 'l6', text: '1000', value: 1000 },
        ]

        let users_content = profile_users.map(user => {
            const {keycloak_id,first_name_latin,last_name_latin,country,city,first_language,primary_email,created_at,study_start_year,status} = user;
            const {membership,membership_type,ticket,convention,galaxy} = status
            //const created_at = new Date(time).toUTCString();
            return (<Table.Row key={keycloak_id}
                               active={keycloak_id === selected_user}
                               onClick={() => this.selectUser(keycloak_id, user)} >
                    <Table.Cell textAlign='center'>
                        <Popup flowing size='mini' position='right center'
                               content={
                                   <Table compact='very'>
                                       {Object.keys(user)?.map(s => {
                                           if(s === "status") return
                                           return (<Table.Row className='table_header'>
                                               <Table.HeaderCell key={s} width={5}>{s}</Table.HeaderCell>
                                               <Table.Cell key={s + 'val'} >{user[s]}</Table.Cell>
                                           </Table.Row>)
                                       })}
                                   </Table>
                               }
                               trigger={<Icon size='large' name='attention' />}
                               // onOpen={() => this.parentInfo(parent)}
                               // onClose={() => this.setState({parent_info: <Segment basic><Loader active /></Segment>})}
                        />
                    </Table.Cell>
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
                </Table.Row>
            )
        });

        return (
            <Container fluid>
                <Message size='large'>
                <Menu size='large' secondary>
                    <Menu.Item>
                        <Menu.Item>
                            <Input type='text' placeholder='Search..' action value={input}
                                   onChange={(e, { value }) => this.setState({input: value})}>
                                <input />
                                <Select compact options={options} value={search}
                                        onChange={(e, { value }) => this.setState({search: value})}/>
                                <Button type='submit' color='blue' disabled={!search}
                                        onClick={() => this.searchUser(search)}>Search</Button>
                            </Input>
                        </Menu.Item>
                        {/*<DatePicker disabled*/}
                        {/*    // locale={locale}*/}
                        {/*    customInput={<Input icon={*/}
                        {/*        <Icon name={date ? 'close' : 'dropdown'} link onClick={() => this.removeFilter("date")} />*/}
                        {/*    }/>}*/}
                        {/*    dateFormat="yyyy-MM-dd"*/}
                        {/*    showYearDropdown*/}
                        {/*    showMonthDropdown*/}
                        {/*    scrollableYearDropdown*/}
                        {/*    maxDate={new Date()}*/}
                        {/*    openToDate={new Date()}*/}
                        {/*    selected={date ? date : null}*/}
                        {/*    placeholderText="Date:"*/}
                        {/*    onChange={this.setDateFilter}*/}
                        {/*/>*/}
                    </Menu.Item>
                    <Menu.Menu>

                    </Menu.Menu>
                    <Menu.Menu position='right'>
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
                <VhEdit
                    {...this.state}
                    setProps={(props) => this.setState({...props})}
                    closeModal={this.clearSelection} />
                <Segment attached textAlign='center' className="group_list" raised loading={loading} >
                    <Table selectable compact='very' basic structured className="admin_table" unstackable fixed>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={1}></Table.Cell>
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
                <Button.Group attached='bottom' compact inverted size='mini'>
                    <Button icon onClick={this.getReverce} ><Icon name='angle double left' /></Button>
                    <Button>
                        <Select compact options={max_options} value={max}
                                onChange={(e, { value }) => this.setState({max: value})}/>
                    </Button>
                    <Button icon onClick={this.getForward} ><Icon name='angle double right' /></Button>
                </Button.Group>
            </Container>
        );
    }
}

export default VhUsers;
