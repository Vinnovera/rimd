# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "css/"
sass_dir = "css/scss/"
images_dir = "css/scss/gfx/"
javascripts_dir = "js/"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style= :compressed
envoronment= :production

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass

require "fileutils"

# Add ".min" to the filename
on_stylesheet_saved do |file|
	if File.exists?(file)
		filename = File.basename(file, File.extname(file))
		
		# Retain direcory structure
		dirname = File.dirname(file)
		dir = dirname.split(css_dir)
		unless dir[1].nil?
			dir = dir[1] + "/"
		else
			dir = ""
		end

		File.rename(file, css_dir + "/" + dir + filename + ".min" + File.extname(file))
	end
end