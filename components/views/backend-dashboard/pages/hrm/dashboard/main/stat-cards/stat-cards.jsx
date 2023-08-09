import React from "react";

import curtains from '../../../../../../../images/curtains.svg';
import style from './cards.module.scss';
import { __ } from "../../../../../../../utilities/helpers.jsx";

const card_stats = [
	{
		label: __( 'Total Job Posts' ),
		count: 12,
		icon: curtains
	},
	{
		label: __( 'Total Applicants' ),
		count: 1232,
		icon: curtains
	},
	{
		label: __( 'Total Hired' ),
		count: 32,
		icon: curtains
	},
	{
		label: __( 'Total Pending' ),
		count: 233,
		icon: curtains
	},
];

export function StatCards() {
	return <div className={'card-wrapper'.classNames(style)}>
		{card_stats.map(stat=>{
			let {label, count, icon} = stat;

			return <div key={label} className={'card'.classNames(style)}>
				<img src={icon}/>
				<strong className={'text-color-primary'.classNames()}>
					{count}
				</strong>
				<span className={'text-color-secondary'.classNames()}>
					{label}
				</span>
			</div>
		})}
	</div>
}