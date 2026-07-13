const fs = require('fs');
const path = 'src/pages/user/ProductDetail.jsx';
let content = fs.readFileSync(path, 'utf8');

const actionsStart = '            {/* Actions */}\n            <div className="space-y-4 sm:space-y-6 mt-auto">';
const actionsEnd = '            </div>\n          </div>\n        </div>\n\n        {/* Section: Frequently Asked Questions */}';

const startIndex = content.indexOf(actionsStart);
const endIndex = content.indexOf('          </div>\n        </div>\n\n        {/* Section: Frequently Asked Questions */}', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  let actionsBlock = content.substring(startIndex, endIndex);
  
  // Remove actions block
  content = content.substring(0, startIndex) + content.substring(endIndex);
  
  // Remove mt-auto from actions
  actionsBlock = actionsBlock.replace('className="space-y-4 sm:space-y-6 mt-auto"', 'className="space-y-4 sm:space-y-6"');
  
  const imgStartMarker = '            <div className="relative flex-1 rounded-2xl lg:rounded-3xl overflow-hidden bg-[#F9F8F6] border border-gray-100 group shadow-md flex p-3 sm:p-4 w-full">';
  const imgEndMarker = '              </button>\n            </div>';
  
  const imgStartIndex = content.indexOf(imgStartMarker);
  const imgEndIndex = content.indexOf(imgEndMarker, imgStartIndex) + imgEndMarker.length;
  
  if (imgStartIndex !== -1 && imgEndIndex !== -1) {
    let imgBlock = content.substring(imgStartIndex, imgEndIndex);
    
    // Remove flex-1 from imgBlock
    imgBlock = imgBlock.replace('className="relative flex-1 rounded-2xl', 'className="relative rounded-2xl');
    
    const newCombinedBlock = '            <div className="flex flex-col flex-1 w-full gap-4 sm:gap-6">\n  ' + imgBlock + '\n\n' + actionsBlock + '            </div>';
    
    content = content.substring(0, imgStartIndex) + newCombinedBlock + content.substring(imgEndIndex);
    
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully moved actions block!');
  } else {
    console.log('Error finding image block.');
  }
} else {
  console.log('Error finding actions block.');
}
