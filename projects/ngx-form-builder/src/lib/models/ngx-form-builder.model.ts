import { FormGroup } from "@angular/forms";

export enum NgxFormControlType {
    placeholder = 'placeholder',
    custom = 'custom'
}

// form model
export interface INgxForm {
    // form label
    label: string;
    // control name
    controlName: string;
    // control Id
    id?: string;
    // control type
    type: NgxFormControlType | string;
    // control css
    controlStyle: string;
    // layout css
    layoutStyle: string;
    // placeholder
    placeholder?: string;
    // default value
    value?: any;
    // validations
    validation: INgxFormValidation;
    // property
    property?: NgxFormProperty;
}

export interface INgxFormValidation {
    required?: boolean;
    email?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    regex?: string;
}

// form property
export class NgxFormProperty {
    // on select or value changed
    onChange($event: any) { }
    // on focus out
    onBlur($event: any) { }
    // on focus in
    onFocus($event: any) { }
    // help text
    helpText: string;
    // append To
    appendTo: string
}

// custom property
export class NgxFormCustomProperty extends NgxFormProperty {
    controlType: string = 'control';
    fieldType?: string;
}

// form result
export interface INgxFormResult {
    formGroup: FormGroup;
    forms: INgxForm[];
}