<?php

namespace CrewHRM\Setup;

use CrewHRM\Helpers\Nonce;
use CrewHRM\Main;
use CrewHRM\Models\Department;
use CrewHRM\Models\Settings;

class Admin extends Main {
	const SLUG_COMPANY_PROFILE = 'crewhrm-settings';
	const SLUG_SETTINGS        = 'crewhrm-company';
	const MOUNTPOINT_SETTINGS  = 'crewhrm_settings';
	const MOUNTPOINT_COMPANY   = 'crewhrm_company_profile';
	const MOUNTPOINT_DASHBOARD = 'crewhrm_dashboard';

	function __construct() {
		add_action( 'admin_menu', array( $this, 'registerMenu' ) );
	}
	
	/**
	 * Register admin menu pages
	 *
	 * @return void
	 */
	public function registerMenu() {
		// Main page
		add_menu_page(
			__( 'Crew HRM', 'crewhrm' ),
			__( 'Crew HRM', 'crewhrm' ),
			'administrator',
			self::$configs->root_menu_slug,
			array( $this, 'mainPage' )
		);

		// Company profile
		add_submenu_page( 
			self::$configs->root_menu_slug, 
			__( 'Company', 'crewhrm' ),
			__( 'Company', 'crewhrm' ), 
			'administrator', 
			self::SLUG_COMPANY_PROFILE, 
			array( $this, 'companyProfilePage' ) 
		);

		// Setting page
		add_submenu_page( 
			self::$configs->root_menu_slug, 
			__( 'Settings', 'crewhrm' ),
			__( 'Settings', 'crewhrm' ), 
			'administrator', 
			self::SLUG_SETTINGS, 
			array( $this, 'settingPage' ) 
		);
	}

	/**
	 * Main page content
	 *
	 * @return void
	 */
	public function mainPage() {
		echo '<div 
				id="' . esc_attr( self::MOUNTPOINT_DASHBOARD ) . '" 
				data-crewhrm-nonce="' . esc_attr( wp_create_nonce( self::MOUNTPOINT_DASHBOARD ) ) . '"
				data-departments="' . esc_attr( json_encode( Department::getDepartments() ) ) . '"></div>';
	}
	
	/**
	 * Setting page content
	 *
	 * @return void
	 */
	public function companyProfilePage() {
		echo '<div 
				id="' . esc_attr( self::MOUNTPOINT_COMPANY ) . '" 
				data-crewhrm-nonce="' . esc_attr( wp_create_nonce( self::MOUNTPOINT_COMPANY ) ) . '"
				data-company-profile="' . esc_attr( json_encode( (object) Settings::getCompanyProfile() ) ) . '"
				data-departments="' . esc_attr( json_encode( Department::getDepartments() ) ) . '"></div>';
	}
	
	/**
	 * Setting page content
	 *
	 * @return void
	 */
	public function settingPage() {
		echo '<div 
			id="' . esc_attr( self::MOUNTPOINT_SETTINGS ) . '" 
			data-crewhrm-nonce="' . esc_attr( wp_create_nonce( self::MOUNTPOINT_SETTINGS ) ) . '"
			data-settings="' . esc_attr( json_encode( (object) Settings::getSettings() ) ) . '"></div>';
	}
}
