import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { INgxForm, INgxFormResult, INgxFormValidation, NgxFormControlType, NgxFormCustomProperty, NgxFormProperty } from '../models/ngx-form-builder.model';

@Injectable({
  providedIn: 'root'
})
export class NgxFormBuilderService {

  constructor() { }

  // json object to form object
  objectToForm(jsonFormObject: INgxForm[], otherPropertyCallback: (controlType: string, property: any) => NgxFormProperty): INgxForm[] {
    const results: INgxForm[] = []
    if (jsonFormObject && jsonFormObject.length > 0) {
      jsonFormObject.forEach(form => {
        // get property
        const property = this.hasPropertyValue(form, 'property') ? form.property : null;
        // control type
        const controlType = this.hasPropertyValue(form, 'type') ? form.type : NgxFormControlType.custom;
        // prepare the form
        const formObj: INgxForm = {
          controlName: form.controlName,
          label: this.hasPropertyValue(form, 'label') ? form.label : '',
          id: this.hasPropertyValue(form, 'id') ? form.id : form.controlName,
          type: controlType,
          value: this.hasProperty(form, 'value') ? form.value : null,
          placeholder: this.hasPropertyValue(form, 'placeholder') ? form.placeholder : '',
          controlStyle: this.hasPropertyValue(form, 'controlStyle') ? form.controlStyle : '',
          layoutStyle: this.hasPropertyValue(form, 'layoutStyle') ? form.layoutStyle : '',
          validation: this.hasPropertyValue(form, 'validation') ? form.validation : null,
          property: this.prepareProperty(controlType, property, otherPropertyCallback),
        }
        results.push(formObj);
      });
    }
    return results;
  }

  // check that objet has property or not
  hasProperty(obj: Object, property: string) {
    return obj && obj.hasOwnProperty(property);
  }

  // check property exist with value
  hasPropertyValue(obj: Object, property: string) {
    return this.hasProperty(obj, property) && obj[property];
  }

  // get property by control name
  getProperty<T extends NgxFormProperty>(controlName: string, forms: INgxForm[]): T {
    if (forms && forms.length > 0) {
      const item = forms.find(m => m.controlName.toLowerCase() == controlName.toLowerCase());
      if (item != null) {
        return item.property as T;
      }
    }
    return null
  }

  // get property type
  prepareProperty(controlType: NgxFormControlType | string,
    property: any,
    otherPropertyCallback: (controlType: string, property: any) => NgxFormProperty): NgxFormProperty {
    switch (controlType) {
      case NgxFormControlType.custom: { return this.getCustomProperty(property); }
      case NgxFormControlType.placeholder: { return this.getPlaceholderProperty(property); }
      default: { return otherPropertyCallback(controlType, property) }
    }
  }

  // set property and value if any
  setProperty(obj: any, obj_key: string, property: NgxFormProperty, valueCheck: boolean = true) {
    if (valueCheck) {
      // for value
      if (this.hasPropertyValue(property, obj_key)) {
        obj[obj_key] = property[obj_key];
      }
    }
    else {
      // only property
      if (this.hasProperty(property, obj_key)) {
        obj[obj_key] = property[obj_key];
      }
    }
  }

  // this is for shared property
  setSharedProperty<T extends NgxFormProperty>(model: T, property: NgxFormProperty) {
    // append to
    this.setProperty(model, 'appendTo', property);
    // helpText
    this.setProperty(model, 'helpText', property);
  }

  // set additional property
  setAdditionalProperty(obj: any, property: NgxFormCustomProperty) {
    // get current property of the models
    const allExistingProperties = Object.keys(obj);
    const givenProperties = Object.keys(property);
    if (givenProperties && givenProperties.length > 0) {
      givenProperties.forEach(propertyId => {
        if (allExistingProperties.indexOf(propertyId) == -1) {
          // set property
          obj[propertyId] = property[propertyId];
        }
      });
    }
  }

  // get custom property
  private getCustomProperty(property: any): NgxFormCustomProperty {
    // create model
    const model = new NgxFormCustomProperty();
    // NULL check
    if (property) {
      // shared property
      this.setSharedProperty(model, property);
      // controlType
      this.setProperty(model, 'controlType', property);
      // for field Type
      this.setProperty(model, 'fieldType', property);
      // set additional property
      this.setAdditionalProperty(model, property);
    }
    return model;
  }

  // place holder property
  private getPlaceholderProperty(property: any): NgxFormProperty {
    // create model
    const model = new NgxFormProperty();
    // NULL check
    if (property) {
      // shared property
      this.setSharedProperty(model, property);
      // set additional property
      this.setAdditionalProperty(model, property);
    }
    return model;
  }

  // get validations
  private getValidations(validation: INgxFormValidation): ValidatorFn[] {
    const results: ValidatorFn[] = [];
    if (validation) {
      // required
      if (validation.required) {
        results.push(Validators.required);
      }
      // email
      if (validation.email) {
        results.push(Validators.email);
      }
      // min length
      if (validation.minLength && validation.minLength > 0) {
        results.push(Validators.minLength(validation.minLength));
      }
      // max length
      if (validation.maxLength && validation.maxLength > 0) {
        results.push(Validators.maxLength(validation.maxLength));
      }
      // min
      if (validation.min && validation.min > 0) {
        results.push(Validators.min(validation.min));
      }
      // max
      if (validation.max && validation.max > 0) {
        results.push(Validators.max(validation.max));
      }
      // regex
      if (validation.regex) {
        results.push(Validators.pattern(validation.regex));
      }
    }
    return results;
  }

  // prepare control
  prepareControl(formGroup: FormGroup, forms: INgxForm[]) {
    // clear the form gropup
    Object.keys(formGroup.controls).forEach(controlName => {
      formGroup.removeControl(controlName);
    });
    // add controls
    this.addControl(formGroup, forms);
  }

  // prepare form
  prepareForm(formBuilder: FormBuilder, jsonObj: INgxForm[], otherPropertyCallback: (controlType: string, property: any) => NgxFormProperty): INgxFormResult {
    // NULL and Length check
    if (jsonObj && jsonObj.length > 0) {
      // reset the form
      const formGroup = formBuilder.group({});
      // prepare the items
      const items = this.objectToForm(jsonObj, otherPropertyCallback);
      // prepare the forms
      this.prepareControl(formGroup, items);
      // call back
      return {
        formGroup: formGroup,
        forms: items
      }
    }
    return null;
  }

  //create control
  createControls(formBuilder: FormBuilder, forms: INgxForm[]): FormGroup {
    // clear the form gropup
    const formGroup = formBuilder.group({});
    // add controls
    this.addControl(formGroup, forms);
    // return
    return formGroup;
  }

  // add controls from forms
  private addControl(formGroup: FormGroup, forms: INgxForm[]) {
    if (forms && forms.length > 0) {
      // form ignore types
      const ignoreTypes: string[] = [NgxFormControlType.placeholder];
      forms.forEach(form => {
        // check for ignore controls
        if (ignoreTypes.indexOf(form.type) == -1) {
          const validations = this.getValidations(form.validation);
          // check for both custom and custom control
          if (form.type == NgxFormControlType.custom) {
            // for custom control
            const property = form.property as NgxFormCustomProperty;
            if (property) {
              switch (property.controlType) {
                case 'array': {
                  formGroup.addControl(form.controlName, new FormArray([], validations));
                } break;
                case 'group': {
                  formGroup.addControl(form.controlName, new FormGroup({}, validations));
                } break;
                default: {
                  formGroup.addControl(form.controlName, new FormControl(form.value, validations));
                } break;
              }
            }
          } else {
            // for normal control
            formGroup.addControl(form.controlName, new FormControl(form.value, validations));
          }
        }
      });
    }
  }


}
