<?php
/**
 * Helper class to get fields from tables
 *
 * @package crewhrm
 */

namespace CrewHRM\Models;

use CrewHRM\Helpers\_Array;

/**
 * The class to get fields
 */
class Field {
	/**
	 * Get specific field/s from table
	 *
	 * @var string
	 */
	private $table;

	/**
	 * Set up the table to operate in
	 *
	 * @param string $table Table name to get data from
	 * @return void
	 */
	public function __construct( string $table ) {
		$this->table = $table;
	}

	/**
	 * Get instance by table name
	 *
	 * @param string $name      The table name to get instance for
	 * @param string $arguments The arguments to make instance with
	 * @return self
	 */
	public static function __callStatic( $name, $arguments ) {
		// Run time cache
		static $instances = array();

		if ( ! isset( $instances[ $name ] ) ) {
			$instances[ $name ] = new self( DB::$name() );
		}

		return $instances[ $name ];
	}

	/**
	 * Get specific fields by specific where clause
	 *
	 * @param array        $where Array of values to use as where clause
	 * @param string|array $field The field or array of fields to get data from the tbale
	 * @return mixed
	 */
	public function getField( array $where, $field ) {
		// Prepare select columns and where clause
		$columns      = is_array( $field ) ? implode( ', ', $field ) : $field;
		$where_clause = '1=1';

		// Loop through conditions
		foreach ( $where as $col => $val ) {
			$where_clause .= " AND {$col}='{$val}'";
		}

		global $wpdb;
		$row = $wpdb->get_row(
			"SELECT {$columns} FROM {$this->table} WHERE {$where_clause} LIMIT 1"
		);
		$row = ! empty( $row ) ? (array) $row : array();
		$row = _Array::castRecursive( $row );

		return ! is_array( $field ) ? ( $row[ $field ] ?? null ) : $row;
	}
}
