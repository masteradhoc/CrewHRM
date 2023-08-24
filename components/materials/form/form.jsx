import React, { createContext, useContext } from "react";
import { DropDown } from "../dropdown/dropdown.jsx";
import { FileUpload } from "../file-ipload/file-upload.jsx";
import { __ } from "../../utilities/helpers.jsx";
import { DateField } from "../date-time/date-time.jsx";
import { ExpandableContent } from "../ExpandableContent/expandable-content.jsx";

const section_label_class = 'd-block font-size-17 font-weight-600 line-height-24 letter-spacing--17 text-color-light text-transform-uppercase margin-bottom-20'.classNames();
const label_class         = 'd-block font-size-15 font-weight-500 margin-bottom-10 text-color-primary'.classNames();
const input_text_class    = 'd-block w-full height-48 padding-15 border-1-5 border-radius-10 border-color-tertiary border-focus-color-primary font-size-15 font-weight-400 line-height-24 letter-spacing--15 text-color-primary'.classNames();
const text_area_class     = 'd-block w-full padding-vertical-15 padding-horizontal-20 border-1-5 border-radius-10 border-color-tertiary border-focus-color-primary font-size-15 font-weight-400 line-height-25 text-color-primary'.classNames();

export const ContextForm = createContext();

export function RenderField({field}) {
	const {name, label, type, placeholder, flex=1, options, disclaimer} = field;
	const {onChange=()=>{}, values={}} = useContext(ContextForm);

	const dispatchChecks=(e)=>{
		const {checked, name, value} = e.currentTarget;

		// If radio button, directly set boolean value
		if ( type === 'radio' ) {
			if ( checked ) {
				onChange(name, value);
			}
			return;
		}

		// If checkbox, put the value in the array
		const array = Array.isArray(values[name]) ? values[name] : [];
		if ( checked ) {
			// Store the value in array if not already
			if ( array.indexOf( value ) === -1 ) {
				array.push(value);
			}
		} else {
			// Delete the value from the array if exists
			const index = array.findIndex( element => element===value );
			if ( index >-1 ) {
				array.splice(index, 1);
			}
		}

		onChange(name, array);
	}

	return <div className={('flex-'+flex).classNames()}>

		{disclaimer && <ExpandableContent className={'margin-bottom-30'.classNames()}>
			<span className={'d-block font-size-20 font-weight-600 text-color-primary'.classNames()}>
				{disclaimer.heading}
			</span>
			<div className={'font-size-15 font-weight-400 line-height-24 letter-spacing--15 text-color-primary'.classNames()}>
				{disclaimer.description}
			</div>
		</ExpandableContent> || null}
		
		<span className={label_class}>{label}</span>
		
		{type=='text' && <input type="text" className={input_text_class} placeholder={placeholder}/> || null}
		
		{type=='textarea' && <textarea className={text_area_class} placeholder={placeholder}></textarea> || null}

		{type=='dropdown' && <DropDown options={options} className={input_text_class}/> || null}
		
		{type=='date' && <DateField className={input_text_class}/> || null}

		{(type=='checkbox' || type=='radio') && <div className={'d-flex flex-flow-row column-gap-20'.classNames()}>
			{options.map(({id:value, label})=>{
				return <label key={value} className={'d-flex flex-flow-row align-items-center column-gap-7 cursor-pointer'.classNames()}>
					<input 
						type={type} 
						name={name} 
						value={value}
						checked={type==='radio' ? values[name]===value : (values[name] || []).findIndex(v=>v==value)>-1}
						onChange={dispatchChecks}/> {label}
				</label>
			})}
			
		</div> || null}

		{type=='file' && 
			<FileUpload 
				value={values[name] || []} 
				textPrimary={placeholder} 
				onChange={files=>onChange(name, files)}/> || null
		}
	</div>
}

export function FormFields({fields}) {
	return fields.map((field, index)=>{
		if ( field===null && fields[index-1]!==null ) {
			return <div key={index} className={'margin-bottom-30'.classNames()}></div>
		}
		
		return <div key={index}>
			{ 
				!Array.isArray(field) && 
				<RenderField field={field}/> || 
				<div className={'d-flex column-gap-10'.classNames()}>
					{field.map((f, i)=><RenderField key={i} field={f}/>)}
				</div>		
			}
		</div>
	});
}

export function Form({fields: sections}) {

	return <ContextForm.Provider value={{}}>
		{Object.keys(sections).map(section_key=>{
			const {section_label, fields=[]} = sections[section_key];
			return <div key={section_key} className={'profile'.classNames() + 'margin-bottom-30'.classNames()}>

				<span className={section_label_class}>
					{section_label}
				</span>

				<FormFields {...{fields}}/>
			</div>
		})}
	</ContextForm.Provider> 
}