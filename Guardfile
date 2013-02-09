# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'shell' do
  watch /.*\.ts$/ do |m|
     `tsc typescript/grd-parser.ts --out psd-grd.js`
  end
end