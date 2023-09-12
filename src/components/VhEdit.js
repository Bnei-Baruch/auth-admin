import React, {Component} from 'react'
import {Menu, Modal, Icon, Table, Loader, Button, Popup, Form, Header, Segment, Divider} from 'semantic-ui-react'

class VhEdit extends Component {

    state = {
        note_area: "",
    };

    componentDidMount() {
    };


    render() {
        const {open_edit, selected_user, status_from_order, payments, orders} = this.props;
        const {keycloak_id,first_name_latin,last_name_latin,country,city,first_language,primary_email,created_at,study_start_year,status} = selected_user;

        if(!selected_user) return

        let v = (<Icon name='checkmark' color='green' />);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let p = (<Icon color='blue' name='cogs'/>);

        return (
            <Modal open={open_edit} onClose={() => this.props.closeModal()} size='fullscreen' >
                {/*<Modal.Header>*/}
                    {/*<Header textAlign="center" >Edit User</Header>*/}
                {/*</Modal.Header>*/}
                <Modal.Content>

                    <Divider horizontal>Orders</Divider>
                    <Segment textAlign='center' className="payment_list" basic >
                        <Table selectable compact='very' className="ingest_table">
                            <Table.Header>
                                {Object.keys(orders.data[0])?.map(s => {
                                    return (
                                        <Table.HeaderCell key={s + 'h'}>{s}</Table.HeaderCell>)
                                })}
                            </Table.Header>
                            {orders.data?.map((p,i) => {
                                    return (
                                        <Table.Row key={i} >
                                            {Object.keys(p)?.map(s => {
                                                if (s === "status") return
                                                return (<Table.Cell key={s + 'val'}>{p[s]}</Table.Cell>)
                                            })}
                                        </Table.Row>
                                    )
                                }
                            )}
                        </Table>
                    </Segment>

                    <Divider horizontal>Payment</Divider>
                    <Segment textAlign='center' className="payment_list" basic >
                    <Table selectable compact='very' className="ingest_table">
                        <Table.Header>
                        {Object.keys(payments.data[0])?.map(s => {
                            return (
                                <Table.HeaderCell key={s + 'h'}>{s}</Table.HeaderCell>)
                        })}
                        </Table.Header>
                        {payments.data?.map((p,i) => {
                                return (
                                    <Table.Row key={i} >
                                        {Object.keys(p)?.map(s => {
                                            if (s === "status") return
                                            return (<Table.Cell key={s + 'val'}>{p[s]}</Table.Cell>)
                                        })}
                                    </Table.Row>
                                )
                            }
                        )}
                    </Table>
                    </Segment>

                    <Divider horizontal>Status</Divider>
                    <Segment textAlign='center'  basic >
                        <Table compact='very' structured unstackable singleLine celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell width={3}>Special</Table.HeaderCell>
                                    <Table.HeaderCell width={3}>Membership</Table.HeaderCell>
                                    <Table.HeaderCell width={3}>Status</Table.HeaderCell>
                                    <Table.HeaderCell width={3}>Ticket</Table.HeaderCell>
                                    <Table.HeaderCell width={2}>Color</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell textAlign='center'>{status_from_order?.is_special ? v : x}</Table.Cell>
                                    <Table.Cell textAlign='center'>{status_from_order?.membership ? v : x}</Table.Cell>
                                    <Table.Cell textAlign='center'>{status_from_order?.status_name}</Table.Cell>
                                    <Table.Cell textAlign='center'>{status_from_order?.ticket ? v : x}</Table.Cell>
                                    <Table.Cell textAlign='center'>{status_from_order?.status_color}</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </Segment>

                    <Form size='large'>
                        {/*<Form.Group widths='equal'>*/}
                        {/*    <Form.Input fluid label='Job name' placeholder="Job name.." required*/}
                        {/*                onChange={e => this.setJobName(e.target.value)}*/}
                        {/*                value={first_name_latin} />*/}
                        {/*    <Form.Input fluid label='File name' placeholder="File name.."*/}
                        {/*                onChange={e => this.setFileName(e.target.value)}*/}
                        {/*                value={last_name_latin} />*/}
                        {/*</Form.Group>*/}
                        {/*<Form.Select placeholder="Add doer.." required*/}
                        {/*             label='Job doers'*/}
                        {/*             selection*/}
                        {/*             multiple*/}
                        {/*             options={doers_list}*/}
                        {/*             value={doers}*/}
                        {/*             onChange={(e, {value}) => this.addDoer(value)} />*/}




                    </Form>
                    {/*<Modal.Description>*/}
                    {/*<Button fluid disabled={!active} onClick={this.clearSelection}>Clear</Button>*/}
                    {/*</Modal.Description>*/}
                </Modal.Content>
                {/*<Modal.Actions>*/}
                {/*    <Menu secondary >*/}
                {/*        <Menu.Item>*/}
                {/*            <Button positive*/}
                {/*                    disabled*/}
                {/*                    onClick={this.setRemoved}>Save*/}
                {/*            </Button>*/}
                {/*        </Menu.Item>*/}
                {/*        <Menu.Menu position='right'>*/}
                {/*            <Menu.Item>*/}
                {/*                <Button negative={true}*/}
                {/*                        disabled*/}
                {/*                        onClick={this.setRemoved}>Remove*/}
                {/*                </Button>*/}
                {/*            </Menu.Item>*/}
                {/*        </Menu.Menu>*/}
                {/*    </Menu>*/}
                {/*</Modal.Actions>*/}
            </Modal>
        );
    }
}

export default VhEdit;
