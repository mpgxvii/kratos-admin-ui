import { Stack } from "@fluentui/react";
import { Button, Input, Label, Title1 } from "@fluentui/react-components";
import { V0alpha2Api } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { getKratosConfig } from "../../../config";
import { SchemaField, SchemaService } from "../../../service/schema-service";
import { Select } from '@fluentui/react-components/unstable';
import "./create.scss"

interface CreateIdentitySiteState {
    schemaOptions: string[];
    schema: object;
    schemaName: string;
    schemaFields: SchemaField[]
    errorText?: string;
}


interface Identity {
    [key: string]: any;
}

class CreateIdentitySite extends React.Component<any, CreateIdentitySiteState> {

    state: CreateIdentitySiteState = {
        schemaOptions: [],
        schema: {},
        schemaFields: [],
        schemaName: "",
        errorText: undefined
    }

    identity: Identity = {};

    componentDidMount() {
        SchemaService.getSchemaIDs().then(data => {
            this.setState({
                schemaOptions: data.map(element => {
                    return element
                })
            }, () => {
                if (this.state.schemaOptions.length === 0) {
                    this.loadSchema("default");
                } else {
                    this.loadSchema(this.state.schemaOptions[0]);
                }
            })
        });
    }

    loadSchema(schema: string | undefined): any {
        if (schema) {
            SchemaService.getSchemaJSON(schema).then(data => {
                this.setState({
                    schema: data,
                    schemaFields: SchemaService.getSchemaFields(data),
                    schemaName: schema
                })
            });
        }
    }

    setValue(field: SchemaField, value: string | undefined) {
        if (value) {
            if (field && field.parentName) {
                if (!this.identity[field.parentName]) {
                    this.identity[field.parentName] = {}
                }
                this.identity[field.parentName][field.name] = value
            } else {
                this.identity[field.name] = value
            }
        }
    }

    create() {
        getKratosConfig().then(config => {
            const adminAPI = new V0alpha2Api(config.adminConfig);
            adminAPI.adminCreateIdentity({
                schema_id: this.state.schemaName,
                traits: this.identity
            }).then(data => {
                this.props.history.push("/identities");
            }).catch(err => {
                this.setState({
                    errorText: JSON.stringify(err.response.data.error)
                })
            })
        })
    }

    render() {
        return (
            <div className="container">
                <Title1 as={"h1"}>Create Identity</Title1>
                <p>Please select the scheme for which you want to create a new identity:</p>
                <div>
                    <Label id="dropdown-default15" style={{ marginTop: 10 }}>
                        Select Scheme
                    </Label> <br />
                    <Select
                        style={{ minWidth: 400, marginBottom: 5 }}
                        aria-labelledby="dropdown-default15"
                        placeholder="Select Scheme"
                        defaultValue={this.state.schemaName}
                        onChange={(e, value) => this.loadSchema(value.value)}
                    >
                        {this.state.schemaOptions.map(key => {
                            return (
                                <option key={key}>
                                    {key}
                                </option>
                            )
                        })}
                    </Select>
                </div>
                <pre className="schemaPre">{JSON.stringify(this.state.schema, null, 2)}</pre>
                <hr></hr>
                {!this.state.errorText || <div className="alert alert-danger">{this.state.errorText}</div>}
                <div>
                    <Stack tokens={{ childrenGap: 5 }}>
                        {this.state.schemaFields.map((elem, key) => {
                            return (<div key={key}>
                                <div key={key}>
                                    <Label htmlFor={"editItem_" + elem.title} style={{ marginBottom: 10 }}>
                                        {elem.title}
                                    </Label><br />
                                    <Input
                                        style={{ minWidth: 400 }}
                                        id={"editItem_" + elem.title}
                                        onChange={(event, value) => {
                                            this.setValue(elem, value.value)
                                        }}
                                    />
                                </div>
                            </div>)
                        })}
                    </Stack>
                    <div style={{ marginTop: 20 }}>
                        <Stack horizontal tokens={{ childrenGap: 20 }}>
                            <Button appearance="primary" onClick={() => this.create()}>Create</Button>
                            <Button onClick={() => this.props.history.push("/identities")}>Close</Button>
                        </Stack>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(CreateIdentitySite);