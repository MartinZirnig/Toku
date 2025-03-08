using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Database.Tables
{
    [Keyless]
    public class PublicClass
    {
        internal Class Class { get; set; }
        public string Password { get; set; }

        internal bool Exists(MysqlContext context)
        {
            Class = Class.Validify(context);

            var result = context.PublicClasses
                .Where(x => x.Password == Password)
                .FirstOrDefault(x => x.Class == Class);

            return result is not null;
        }
        
        internal PublicClass Validify(MysqlContext context)
        {
            Class = Class.Validify(context);

            var result = context.PublicClasses
                .Where(x => x.Password == Password)
                .FirstOrDefault(x => x.Class == Class);
            
            if (result is null)
            {
                context.PublicClasses.Add(this);
                context.SaveChanges();
                return this;
            } 

            return result;
        }
    }
}
