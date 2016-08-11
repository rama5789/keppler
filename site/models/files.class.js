'use strict'

// Dependencies
let paths         = require( '../utils/paths.class.js' ),
	File          = require( './file.class.js' )

class Files
{
	constructor( _options )
	{
		this.items  = {}
		this.socket = _options.socket
	}

	create( _path, _content )
	{
		// Set up
		let normalized_path = paths.normalize( _path ),
			parsed_path     = paths.parse( normalized_path )

		// Retrieve file
		let file = this.get( normalized_path )

		// File already exist
		if( file )
			return false

		// Create
		file = new File( {
			name   : parsed_path.base,
			path   : parsed_path.dir,
			content: _content,
			socket : this.socket
		} )

		// Save
		this.items[ normalized_path ] = file

		// Emit
		this.socket.emit( 'create_file', file.describe() )

		return file
	}

	get( _path, _force_creation )
	{
		// Params
		if( typeof _force_creation === 'undefined' )
			_force_creation = false

		// Set up
		let normalized_path = paths.normalize( _path )

		// Retrieve file
		let file = this.items[ normalized_path ]

		// File found
		if( typeof file !== 'undefined' )
		{
			return file
		}

		// Force creation
		if( _force_creation )
		{
			file = this.create( normalized_path )
			return file
		}

		// Not found
		return false
	}

	create_version( _path, _content )
	{
		// Set up
		let normalized_path = paths.normalize( _path )

		// Retrieve file
		let file = this.get( normalized_path, true )

		// Create version
		file.create_version( _content )

    	return file
	}

	delete( _path )
	{
		// Set up
		let normalized_path = paths.normalize( _path )

		// Retrieve file
		let file = this.get( normalized_path )

		// File found
		if( file )
		{
			// Delete file
			file.destructor()
			delete this.items[ normalized_path ]

			// Emit
			this.socket.emit( 'delete_file', file.describe() )

			return true
		}

		return false
	}

	describe()
	{
		// Set up
		let result = {}

		// Each file
		for( let _file_path in this.items )
		{
			let _file = this.items[ _file_path ]

			result[ _file_path ] = _file.describe()
		}

		return result
	}
}

module.exports = Files
