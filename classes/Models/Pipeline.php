<?php

namespace CrewHRM\Models;

use CrewHRM\Helpers\_Array;

class Pipeline {
	/**
	 * Create pipeline entry
	 *
	 * @param int $application_id
	 * @param int $stage_id
	 * @param int $action_taker_id
	 * @return void
	 */
	public static function create( $application_id, $stage_id, $action_taker_id ) {
		global $wpdb;
		$wpdb->insert(
			DB::pipeline(),
			array(
				'application_id'  => $application_id,
				'stage_id'        => $stage_id,
				'action_taker_id' => $action_taker_id,
			)
		);
	}

	/**
	 * Get activity/pipeline for an application.
	 * -----------------------------------------
	 * We're combining all type of activities in a single array without pagination.
	 * Because single applicant acitvity log is never expected to be bigger than 100 which also too long in this case. 
	 *
	 * @param int $application_id
	 * @return array|null
	 */
	public static function getPipeLine( $application_id ) {
		global $wpdb;
		$pipeline = array();

		// -------------- First of all get the apply date and info --------------
		$application = Field::applications()->getField(
			array( 'application_id' => $application_id ),
			array( 'first_name', 'last_name', 'UNIX_TIMESTAMP(application_date) AS timestamp' )
		);

		// Check if the application exists
		if ( empty( $application ) ) {
			return null;
		}

		$pipeline[] = array(
			'type'       => 'apply',
			'by'         => $application['first_name'] . ' ' . $application['last_name'],
			'avatar_url' => null,
			'timestamp'  => $application['timestamp']
		);

		// ---------------- Add comments ----------------
		$comments = Comment::getComments( $application_id );
		foreach ( $comments as $comment ) {
			$pipeline[] = array(
				'type'       => 'comment',
				'by'         => $comment['commenter_name'],
				'avatar_url' => get_avatar_url( $comment['commenter_id'] ),
				'comment'    => $comment['comment_content'],
				'timestamp'  => $comment['timestamp']
			);
		}

		// --------------- Add application stage changes ---------------
		$logs = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT 
					pipe.application_id, 
					pipe.stage_id, 
					pipe.action_taker_id, 
					UNIX_TIMESTAMP(pipe.action_date) AS timestamp,
					stage.stage_name, 
					_user.display_name AS action_taker_name
				FROM 
					" . DB::pipeline() . " pipe
					LEFT JOIN " . DB::stages() . " stage ON pipe.stage_id=stage.stage_id
					LEFT JOIN {$wpdb->users} _user ON pipe.action_taker_id=_user.ID
				WHERE
					pipe.application_id=%d",
				$application_id
			),
			ARRAY_A
		);

		// Loop through stage changes log and put to the combined pipeline array
		foreach ( $logs as $log ) {
			// Cast numbers
			$log = _Array::castRecursive( $log );

			$pipeline[] = array(
				'type'       => 'move',
				'by'         => $log['action_taker_name'],
				'avatar_url' => get_avatar_url( $log['action_taker_id'] ),
				'timestamp'  => $log['timestamp'],
				'stage_id'   => $log['stage_id'],
				'stage_name' => $log['stage_name'],
			);
		}

		// ---------- Now sort all by timestamp ----------
		$_pipeline = array();
		$timestamps = array_column( $pipeline, 'timestamp' );
		rsort( $timestamps );

		// Loop through ordered timestamps
		foreach ( $timestamps as $timestamp ) {

			// Loop through pipelines and put to the new array as per timestamp order
			foreach ( $pipeline as $log ) {
				if ( $log['timestamp'] === $timestamp ) {
					$_pipeline[] = $log;
				}
			}
		}

		return $_pipeline;
	}
}