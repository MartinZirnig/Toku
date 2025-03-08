using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Database.Tables
{
    public class Message : HasTimeFlag
    {
        internal uint MessageId { get; set; }
        public string Content { get; set; }
        internal User Sender { get; set; }
        internal bool IsDeleted { get; set; }

        public void SetTime(DateTime time) =>
            CreatedTime = time;
        
        internal Message? GetFromDb(MysqlContext context, User sender)
        {
            var set = context.Messages
                .Where(x => x.Sender == sender)
                .FirstOrDefault(x => x.CreatedTime == CreatedTime);
            return set;
        }

    }
}
